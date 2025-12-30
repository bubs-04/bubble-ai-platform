"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const [loginStep, setLoginStep] = useState<"role-select" | "form">("role-select");
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | null>(null);
  const [isLogin, setIsLogin] = useState(true); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSent, setLeadSent] = useState(false);

  const router = useRouter();

  const resetModal = () => {
    setShowModal(false);
    setLoginStep("role-select");
    setSelectedRole(null);
    setIsLogin(true);
    setError("");
    setEmail("");
    setPassword("");
    setAccessCode("");
  };

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
        // --- LOGIN LOGIC ---
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
      } else {
        // --- SIGN UP LOGIC ---
        
        // 1. Check Codes & Assign School
        let assignedSchoolId = null;

        if (selectedRole === "student") {
            if (accessCode !== "BUBBLE-STUDENT") throw new Error("Invalid Class Code.");
            assignedSchoolId = "demo_school"; // FIX: Connects student to content
        }
        if (selectedRole === "teacher") {
            if (accessCode !== "BUBBLE-TEACH") throw new Error("Invalid School Code.");
            assignedSchoolId = "demo_school"; // FIX: Connects teacher to content
        }

        if (!fullName) throw new Error("Full name is required.");

        // 2. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 3. Update Display Name
        await updateProfile(user, { displayName: fullName });

        // 4. Save User Data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          email: email,
          displayName: fullName,
          role: selectedRole,
          createdAt: serverTimestamp(),
          schoolId: assignedSchoolId,
          classIds: [] // Initialize empty array so dashboard doesn't crash
        });

        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail) return;
    try {
      await addDoc(collection(db, "leads"), { email: leadEmail, createdAt: serverTimestamp(), source: "hero_input" });
      setLeadSent(true);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
               <span className="text-white font-bold text-lg">B</span>
             </div>
             <span className="text-xl font-bold tracking-tight">BubbleAI</span>
          </div>
          <button onClick={() => setShowModal(true)} className="text-sm font-bold text-white bg-white/10 border border-white/10 px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all">
            Portal Login
          </button>
        </div>
      </nav>

      <section className="pt-40 pb-20 px-6 max-w-5xl mx-auto text-center relative">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1]">
          Step Into the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Age of AI.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          The immersive learning ecosystem where students build the future. Safe, guided, and hands-on.
        </p>
        
        {/* Waitlist Input */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
          {!leadSent ? (
            <>
              <input 
                type="email" 
                placeholder="Enter school email address" 
                className="w-full sm:w-2/3 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
              />
              <button 
                onClick={handleLeadSubmit}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap"
              >
                Join Waitlist
              </button>
            </>
          ) : (
             <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-6 py-4 rounded-full flex items-center gap-2 w-full justify-center">
               <span>✨ You're on the list. We'll be in touch.</span>
             </div>
          )}
        </div>
      </section>

      {/* FOOTER WITH VERSION TAG */}
      <footer className="py-10 text-center text-gray-800 text-xs">
        <p>BubbleAI System v3.0 • Final Login Sync</p>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-200">
          <div className="bg-[#111] border border-white/10 text-white rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col min-h-[400px]">
            <button onClick={resetModal} className="absolute top-4 right-4 text-gray-500 hover:text-white z-10">✕</button>

            {loginStep === "role-select" && (
              <div className="p-8 flex flex-col h-full justify-center">
                <h2 className="text-2xl font-bold text-center mb-2">Who are you?</h2>
                <p className="text-gray-500 text-center text-sm mb-8">Select your portal to continue.</p>
                <div className="grid gap-4">
                  <button onClick={() => handleRoleSelect("student")} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-600/20 hover:border-blue-500 transition-all group text-left">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🎓</div>
                    <div><h3 className="font-bold text-lg group-hover:text-blue-400">Student</h3><p className="text-xs text-gray-500">Access classes</p></div>
                  </button>
                  <button onClick={() => handleRoleSelect("teacher")} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-600/20 hover:border-purple-500 transition-all group text-left">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">👩‍🏫</div>
                    <div><h3 className="font-bold text-lg group-hover:text-purple-400">Teacher</h3><p className="text-xs text-gray-500">Manage curriculum</p></div>
                  </button>
                </div>
              </div>
            )}

            {loginStep === "form" && selectedRole && (
              <div className="p-8">
                <button onClick={() => setLoginStep("role-select")} className="text-gray-500 hover:text-white text-xs mb-6 flex items-center gap-1">← Back</button>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold capitalize">{selectedRole} Portal</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {!isLogin && (
                    <>
                      <input type="text" placeholder="Full Name" className="w-full bg-[#1A1A1A] border border-white/10 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-blue-500" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      <input type="text" placeholder={selectedRole === "student" ? "Class Code (BUBBLE-STUDENT)" : "School Code (BUBBLE-TEACH)"} className="w-full bg-[#1A1A1A] border border-white/10 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-yellow-500 placeholder-gray-500" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />
                    </>
                  )}
                  <input type="email" placeholder="Email Address" className="w-full bg-[#1A1A1A] border border-white/10 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input type="password" placeholder="Password" className="w-full bg-[#1A1A1A] border border-white/10 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} />
                  {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                  <button disabled={loading} className={`w-full font-bold text-sm py-3 rounded-lg transition-all mt-2 ${selectedRole === 'student' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-purple-600 hover:bg-purple-500'}`}>
                    {loading ? "Processing..." : (isLogin ? "Log In" : "Create Account")}
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    {isLogin ? "First time here?" : "Already have an account?"}
                    <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="ml-2 text-white font-bold hover:underline">{isLogin ? "Join Class" : "Log In"}</button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}