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
  
  // Lead Generation State
  const [leadEmail, setLeadEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [leadSent, setLeadSent] = useState(false);

  const router = useRouter();

  // --- LOGIN LOGIC ---
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
    } catch (err) {
      console.error(err);
    }
  };

  // --- LEAD GEN LOGIC (Sales Bot 🤖) ---
  const handleContactSales = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail || !schoolName) return;
    
    try {
      await addDoc(collection(db, "leads"), {
        school: schoolName,
        email: leadEmail,
        createdAt: serverTimestamp(),
        status: "new"
      });
      setLeadSent(true);
    } catch (err) {
      console.error("Error saving lead", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">B</div>
            <span className="text-xl font-bold tracking-tight">BubbleAI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">Curriculum</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">Schools</a>
            <button 
              onClick={() => setShowLogin(true)}
              className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-all"
            >
              Portal Login
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
          Now Available for Grades 6-12
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
          The Operating System <br /> for AI Education.
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Don't just teach from a textbook. Give your students a live AI laboratory. 
          BubbleAI is the turnkey curriculum platform for modern schools.
        </p>
        
        {/* LEAD CAPTURE FORM */}
        {!leadSent ? (
          <form onSubmit={handleContactSales} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="School Email Address" 
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              required
            />
            <input 
              type="text" 
              placeholder="School Name" 
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all sm:hidden"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg transition-all whitespace-nowrap">
              Request Demo
            </button>
          </form>
        ) : (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg max-w-md mx-auto">
            🚀 <strong>Received.</strong> Our education team will contact you shortly.
          </div>
        )}
      </section>

      {/* --- DASHBOARD PREVIEW --- */}
      <div className="max-w-6xl mx-auto px-4 mb-32">
        <div className="rounded-xl border border-white/10 bg-gray-900/50 p-2 shadow-2xl shadow-blue-900/20 backdrop-blur-sm">
           <div className="aspect-video rounded-lg bg-gray-800 flex items-center justify-center border border-white/5 relative overflow-hidden group">
             {/* Fake UI for visual appeal */}
             <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
               <div className="text-6xl mb-4">🖥️</div>
               <p className="text-gray-500 font-mono text-sm">BubbleAI Teacher Dashboard Preview</p>
             </div>
           </div>
        </div>
      </div>

      {/* --- LOGIN MODAL --- */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white text-black rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold"
            >
              ✕
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-1">Welcome Back</h2>
              <p className="text-gray-500 text-sm">Login to your school portal</p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all mb-6"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
              Continue with Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase text-gray-400 bg-white px-2">Or email</div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all"
              >
                {loading ? "Verifying..." : "Log In"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 py-12 text-center text-gray-500 text-sm">
        <p>&copy; 2026 BubbleAI Inc. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-4">
           <a href="#" className="hover:text-white">Privacy</a>
           <a href="#" className="hover:text-white">Terms</a>
           <a href="#" className="hover:text-white">Contact</a>
        </div>
      </footer>
    </div>
  );
}