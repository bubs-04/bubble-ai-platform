"use client";

import { useState } from "react";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSent, setLeadSent] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err) { console.error(err); }
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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
               <span className="text-white font-bold text-lg">B</span>
             </div>
             <span className="text-xl font-bold tracking-tight">BubbleAI</span>
          </div>
          <button 
            onClick={() => setShowLogin(true)}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors border border-white/10 px-6 py-2 rounded-full hover:bg-white/5"
          >
            Log In
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-40 pb-20 px-6 max-w-5xl mx-auto text-center relative">
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1]">
          Step Into the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Age of AI.
          </span>
        </h1>

        <h2 className="text-2xl font-light text-gray-400 mb-8">
          The Immersive Learning Ecosystem.
        </h2>

        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Don't just watch AI happen. Build it. BubbleAI gives your school a complete, safe, and hands-on curriculum platform.
        </p>
        
        {/* --- FIXED INPUT (Separate Button) --- */}
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

      {/* --- VIDEO PLACEHOLDER SECTION --- */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl overflow-hidden backdrop-blur-sm">
           <div className="aspect-video rounded-xl bg-black relative flex items-center justify-center group overflow-hidden">
             
             {/* This is where your future demo video goes */}
             <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-80"></div>
             
             <div className="text-center z-10 p-6">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform cursor-pointer">
                  <div className="ml-1 w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent"></div>
                </div>
                <h3 className="text-2xl font-bold mb-2">See BubbleAI in Action</h3>
                <p className="text-gray-500 text-sm">Watch how we transform the classroom (1:30)</p>
             </div>

           </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="py-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-blue-400">Curriculum First</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              We don't just give you a chatbot. We give you a 30-week syllabus, lesson plans, and graded assignments.
            </p>
          </div>
          <div className="p-6">
             <h3 className="text-xl font-bold mb-2 text-indigo-400">Walled Garden</h3>
             <p className="text-gray-500 text-sm leading-relaxed">
               Students access AI tools in a monitored environment. No personal accounts or phone numbers required.
             </p>
          </div>
          <div className="p-6">
             <h3 className="text-xl font-bold mb-2 text-purple-400">Teacher Control</h3>
             <p className="text-gray-500 text-sm leading-relaxed">
               Review every prompt your students send. Manage grades and progress from a central dashboard.
             </p>
          </div>
        </div>
      </section>

      {/* --- LOGIN OVERLAY --- */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] border border-white/10 text-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/20">
                <span className="text-3xl font-bold">B</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Portal Access</h2>
              <p className="text-gray-500 text-sm">Students & Faculty Login</p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-all mb-6 flex items-center justify-center gap-2"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
              Continue with Google
            </button>

            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none text-white" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none text-white" value={password} onChange={(e) => setPassword(e.target.value)} />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all">
                {loading ? "Verifying..." : "Log In"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}