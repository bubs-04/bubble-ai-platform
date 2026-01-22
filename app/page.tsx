"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { serverTimestamp, doc, setDoc, getDocs, query, collection, where } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true); 
  const [role, setRole] = useState<"student" | "teacher" | "master">("student");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accessCode, setAccessCode] = useState(""); // The Magic Key
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // --- LOG IN ---
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
      } else {
        // --- SIGN UP (THE SORTING HAT) ---
        let schoolId = "";
        let classId = "";
        let approved = true;

        // 1. VERIFY CODES
        if (role === "master") {
            if (accessCode !== "BUBBLE-MASTER-KEY-999") throw new Error("Invalid Master Key.");
        } 
        else if (role === "teacher") {
             // In real app, check against invited teachers list. For Demo:
             if (accessCode !== "BUBBLE-TEACH-DEMO") throw new Error("Invalid Teacher Code.");
             schoolId = "demo_school";
        }
        else if (role === "student") {
             // Find class by code
             const q = query(collection(db, "classrooms"), where("classCode", "==", accessCode));
             const snap = await getDocs(q);
             if (snap.empty) throw new Error("Invalid Class Code.");
             
             const classData = snap.docs[0].data();
             schoolId = classData.schoolId;
             classId = snap.docs[0].id;
             approved = false; // Teacher must approve
        }

        // 2. CREATE ACCOUNT
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: fullName });

        // 3. SAVE PROFILE
        await setDoc(doc(db, "users", user.uid), {
          email,
          displayName: fullName,
          role,
          schoolId,
          classIds: classId ? [classId] : [],
          approved,
          createdAt: serverTimestamp(),
        });

        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className="text-6xl font-bold tracking-tighter mb-4">Bubble<span className="text-blue-500">AI</span></h1>
        <p className="text-gray-400 text-lg">Jump into your bubble.</p>
      </div>

      <div className="bg-[#111] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
          {(["student", "teacher", "master"] as const).map((r) => (
            <button key={r} onClick={() => { setRole(r); setIsLogin(true); setError(""); }}
              className={`flex-1 py-2 text-sm font-bold rounded-md capitalize transition-all ${role === r ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}>
              {r}
            </button>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-4 capitalize">{isLogin ? "Welcome Back" : `New ${role} Registration`}</h2>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <input type="text" placeholder="Full Name" className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} required />
              <input type="text" placeholder={role === 'student' ? 'Class Code' : 'Access Code'} className="input-field border-yellow-500/50" value={accessCode} onChange={e => setAccessCode(e.target.value)} required />
            </>
          )}
          <input type="email" placeholder="Email Address" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition-all">
            {loading ? "Processing..." : (isLogin ? "Enter Portal" : "Submit Registration")}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500 cursor-pointer hover:text-white" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "First time here? Create Account" : "Already registered? Login"}
        </p>
      </div>
      
      {/* Styles for inputs to keep code clean */}
      <style jsx>{`
        .input-field {
          width: 100%;
          background: #222;
          border: 1px solid #333;
          padding: 12px;
          border-radius: 8px;
          color: white;
          outline: none;
        }
        .input-field:focus { border-color: #3b82f6; }
      `}</style>
    </div>
  );
}