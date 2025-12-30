"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { serverTimestamp, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const [loginStep, setLoginStep] = useState<"role-select" | "form">("role-select");
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | null>(null);
  const [isLogin, setIsLogin] = useState(true); 
  
  // Form Data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRoleSelect = (role: "student" | "teacher") => {
    setSelectedRole(role);
    setLoginStep("form");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
      } else {
        // --- SECURITY CHECK ---
        let assignedSchoolId = "demo_school"; // Default for this MVP

        if (selectedRole === "student" && accessCode !== "BUBBLE-STUDENT") {
           throw new Error("Invalid Class Code.");
        }
        if (selectedRole === "teacher" && accessCode !== "BUBBLE-TEACH") {
           throw new Error("Invalid School Code.");
        }
        if (!fullName) throw new Error("Full name is required.");

        // --- CREATE USER ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });

        // --- SAVE TO DB ---
        await setDoc(doc(db, "users", user.uid), {
          email: email,
          displayName: fullName,
          role: selectedRole,
          createdAt: serverTimestamp(),
          schoolId: assignedSchoolId, 
        });

        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-md p-6 flex justify-between items-center fixed w-full z-50">
        <div className="text-xl font-bold tracking-tight flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">B</div>
           BubbleAI
        </div>
        <button onClick={() => setShowModal(true)} className="text-sm font-bold bg-white/10 px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all">
          Portal Login
        </button>
      </nav>

      {/* HERO */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-20">
         <h1 className="text-6xl font-bold mb-6 tracking-tighter">The Future of <span className="text-blue-500">Curriculum.</span></h1>
         <p className="text-gray-500 max-w-lg text-lg mb-10">Secure, AI-powered learning environments. Pre-installed content for modern schools.</p>
      </section>

      {/* LOGIN MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#111] border border-white/10 text-white rounded-2xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>

            {loginStep === "role-select" && (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-6">Select Portal</h2>
                <div className="grid gap-4">
                  <button onClick={() => handleRoleSelect("student")} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-600/20 hover:border-blue-500 transition-all text-left flex items-center gap-4">
                    <span className="text-2xl">🎓</span>
                    <div><h3 className="font-bold">Student</h3><p className="text-xs text-gray-500">Access Learning Dashboard</p></div>
                  </button>
                  <button onClick={() => handleRoleSelect("teacher")} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-purple-600/20 hover:border-purple-500 transition-all text-left flex items-center gap-4">
                    <span className="text-2xl">👩‍🏫</span>
                    <div><h3 className="font-bold">Teacher</h3><p className="text-xs text-gray-500">Manage Curriculum</p></div>
                  </button>
                </div>
              </div>
            )}

            {loginStep === "form" && (
              <div>
                <button onClick={() => setLoginStep("role-select")} className="text-gray-500 text-xs mb-4">← Back</button>
                <h2 className="text-xl font-bold mb-4 capitalize">{selectedRole} Login</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {!isLogin && (
                    <>
                      <input type="text" placeholder="Full Name" className="w-full bg-[#222] border border-white/10 rounded-lg px-4 py-3 outline-none" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      <input type="text" placeholder={selectedRole === 'student' ? 'Class Code (BUBBLE-STUDENT)' : 'School Code (BUBBLE-TEACH)'} className="w-full bg-[#222] border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-yellow-500" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />
                    </>
                  )}
                  <input type="email" placeholder="Email" className="w-full bg-[#222] border border-white/10 rounded-lg px-4 py-3 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input type="password" placeholder="Password" className="w-full bg-[#222] border border-white/10 rounded-lg px-4 py-3 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
                  
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  
                  <button disabled={loading} className="w-full bg-blue-600 py-3 rounded-lg font-bold hover:bg-blue-500 transition-all">
                    {loading ? "Processing..." : (isLogin ? "Log In" : "Activate Account")}
                  </button>
                </form>
                <p className="text-center text-xs text-gray-500 mt-4 cursor-pointer hover:text-white" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "Need to activate an account?" : "Already have an account?"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}