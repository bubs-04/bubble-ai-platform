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
      
      {/* --- AMBIENT GLOW (The Bubble Effect) --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        {/* Blue Bubble */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        {/* Purple Bubble */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
               <span className="text-white font-bold text-lg">B</span>
             </div>
             <span className="text-xl font-bold tracking-tight">BubbleAI</span>
          </div>
          <button 
            onClick={() => setShowLogin(true)}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-full hover:bg-white/5"
          >
            Login
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-48 pb-24 px-6 max-w-5xl mx-auto text-center relative">
        
        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-[1.1]">
          Step Into the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Age of AI.
          </span>
        </h1>

        {/* The "Step into the Bubble" Subhead */}
        <h2 className="text-2xl md:text-3xl font-light text-gray-300 mb-8">
          Step into the Bubble.
        </h2>

        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-12 leading-relaxed">
          The immersive learning ecosystem where students don't just study the future—they build it. Safe, guided, and hands-on.
        </p>
        
        {/* Input Field */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!leadSent ? (
            <form onSubmit={handleLeadSubmit} className="relative w-full max-w-sm group">
              <input 
                type="email" 
                placeholder="Enter school email address" 
                className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 pr-36 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                required
              />
              <button type="submit" className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 rounded-full transition-all shadow-lg shadow-blue-900/20">
                Join the Waitlist
              </button>
            </form>
          ) : (
             <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-6 py-3 rounded-full flex items-center gap-2">
               <span>✨ You're on the list. We'll be in touch.</span>
             </div>
          )}
        </div>
      </section>

      {/* --- FEATURES (Glass Cards) --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-2xl mb-6 text-blue-400">⚡</div>
            <h3 className="text-xl font-bold mb-2">Interactive Learning</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Move beyond textbooks. Our platform offers live AI labs where students experiment safely.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
             <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-2xl mb-6 text-indigo-400">🛡️</div>
             <h3 className="text-xl font-bold mb-2">Safe & Ethical</h3>
             <p className="text-gray-500 leading-relaxed text-sm">
               A walled garden for AI. We teach responsible usage and ethics before tools are unlocked.
             </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
             <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-2xl mb-6 text-purple-400">🌍</div>
             <h3 className="text-xl font-bold mb-2">Global Curriculum</h3>
             <p className="text-gray-500 leading-relaxed text-sm">
               Standardized lessons for Grades 6-12, available in multiple languages for global reach.
             </p>
          </div>

        </div>
      </section>

      {/* --- LOGIN OVERLAY --- */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
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
              <h2 className="text-2xl font-bold mb-2">Step into the Bubble</h2>
              <p className="text-gray-500 text-sm">Access your school portal</p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-all mb-6 flex items-center justify-center gap-2"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
              Continue with Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase text-gray-600 bg-[#0A0A0A] px-2 font-bold tracking-wider">Or</div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-blue-500 transition-all text-white placeholder-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-blue-500 transition-all text-white placeholder-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
              <button 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-900/20"
              >
                {loading ? "Verifying..." : "Enter Portal"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 py-12 text-center text-gray-700 text-sm">
        <p>&copy; 2026 BubbleAI Inc.</p>
      </footer>
    </div>
  );
}