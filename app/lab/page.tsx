"use client";

import { useState, useRef, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function AILab() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("text"); // 'text' or 'image'
  const [user, setUser] = useState<any>(null);
  
  const router = useRouter();
  const bottomRef = useRef<null | HTMLDivElement>(null);

  // Check Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/");
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  // Auto-scroll to bottom when text generates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [response, loading]);

  // --- THE "BRAIN" (Real Gemini AI) ---
  const runExperiment = async () => {
    if (!prompt) return;
    setLoading(true);
    setResponse(""); 

    try {
      let realText = "";

      if (mode === "text") {
        // 1. CALL OUR API ROUTE (Talks to Google Gemini)
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);
        realText = data.result;

      } else {
        // IMAGE MODE (Simulation for now - Real Image Gen costs $$)
        await new Promise(r => setTimeout(r, 2000));
        realText = "https://placehold.co/600x400/1a1a1a/FFF?text=Image+Generation+Coming+Soon";
        setResponse(realText); // Just show the image link/placeholder
      }

      // 2. STREAM THE TEXT (Typewriter Effect for Text Mode)
      if (mode === "text") {
        const words = realText.split(" ");
        for (let i = 0; i < words.length; i++) {
          setResponse(prev => prev + words[i] + " ");
          await new Promise(r => setTimeout(r, 30)); // Typing speed
        }
      }

      // 3. LOG THE EXPERIMENT (Teacher Supervision)
      if (user) {
        await addDoc(collection(db, "experiments"), {
          uid: user.uid,
          prompt: prompt,
          response: realText,
          type: mode,
          timestamp: serverTimestamp()
        });
      }

    } catch (error) {
      console.error(error);
      setResponse("⚠️ System Overload: The AI could not process this request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans flex flex-col">
      
      {/* --- HEADER --- */}
      <header className="border-b border-white/10 bg-[#0A0A0A] p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="hover:bg-white/10 p-2 rounded-lg transition-all text-sm text-gray-400 hover:text-white">
            ← Back to Dashboard
          </button>
          <div>
            <h1 className="font-bold text-lg flex items-center gap-2">
              <span className="text-blue-400">⚡</span> The Lab
            </h1>
            <p className="text-xs text-gray-500">Sandbox Environment • v2.0</p>
          </div>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
          <button 
            onClick={() => { setMode("text"); setResponse(""); }}
            className={`px-3 py-1 text-sm rounded-md transition-all ${mode === 'text' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Text Gen
          </button>
          <button 
             onClick={() => { setMode("image"); setResponse(""); }}
             className={`px-3 py-1 text-sm rounded-md transition-all ${mode === 'image' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Image Gen
          </button>
        </div>
      </header>

      {/* --- MAIN WORKSPACE --- */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 gap-6">
        
        {/* OUTPUT SCREEN */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 overflow-y-auto min-h-[400px] relative shadow-inner shadow-black/50">
          {!response && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 opacity-50">
              <div className="text-6xl mb-4">🧪</div>
              <p>Ready for experimentation.</p>
              <p className="text-sm">Select a tool and enter a prompt.</p>
            </div>
          )}

          {/* Loading State */}
          {loading && !response && (
            <div className="flex items-center gap-2 text-blue-400 animate-pulse">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
              <span className="text-sm font-mono uppercase">Processing Neural Net...</span>
            </div>
          )}

          {/* Actual Output */}
          {response && mode === "text" && (
            <div className="prose prose-invert max-w-none animate-in fade-in duration-500">
               <p className="whitespace-pre-wrap leading-relaxed text-gray-200">{response}</p>
            </div>
          )}

          {/* Image Output (Placeholder) */}
          {response && mode === "image" && (
            <div className="flex justify-center items-center h-full animate-in zoom-in duration-500">
              <img src={response} alt="Generated output" className="rounded-xl border border-white/20 shadow-2xl" />
            </div>
          )}
          
          <div ref={bottomRef}></div>
        </div>

        {/* INPUT CONSOLE */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-2 flex gap-2 items-end shadow-2xl">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={mode === 'text' ? "Enter your prompt here (e.g. 'Write a haiku about space')..." : "Describe the image you want to generate..."}
            className="w-full bg-transparent text-white p-4 outline-none resize-none h-24 placeholder-gray-600 font-mono text-sm"
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runExperiment(); }}}
          />
          <button 
            onClick={runExperiment}
            disabled={!prompt || loading}
            className={`mb-2 mr-2 p-3 rounded-xl font-bold transition-all flex items-center gap-2 ${!prompt || loading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 active:scale-95'}`}
          >
            {loading ? "Running..." : "Run ⚡"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-600">
          ⚠️ AI can make mistakes. All experiments are logged for teacher review.
        </p>

      </main>
    </div>
  );
}