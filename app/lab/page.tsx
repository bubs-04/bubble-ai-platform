"use client";

import { useState, useRef, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AILab() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("text"); // 'text' or 'image'
  const router = useRouter();
  const bottomRef = useRef<null | HTMLDivElement>(null);

  // --- THE "BRAIN" (Simulated for Speed) ---
  const runExperiment = async () => {
    if (!prompt) return;
    setLoading(true);
    setResponse(""); // Clear previous

    // 1. SIMULATE THINKING TIME (Makes it feel real)
    await new Promise(r => setTimeout(r, 1500));

    // 2. GENERATE RESPONSE (Demo Mode)
    // Later, we replace this with: await fetch('/api/generate', ...)
    let fakeAIResponse = "";
    
    if (mode === "text") {
      fakeAIResponse = `[DEMO MODE: CONNECT API FOR REAL AI]\n\nThat is a fascinating question about "${prompt}". \n\nIn a real AI model, this is where I would explain the concept in detail, break down the logic, and provide examples. As a student in the BubbleAI Lab, you are learning how to craft prompts that get the best results. \n\nTry asking me to "Write a poem about Python" or "Explain gravity to a 5th grader."`;
    } else {
      fakeAIResponse = "https://placehold.co/600x400/1a1a1a/FFF?text=AI+Generated+Image+Preview";
    }

    // 3. STREAM THE TEXT (Typewriter Effect)
    if (mode === "text") {
      const words = fakeAIResponse.split(" ");
      for (let i = 0; i < words.length; i++) {
        setResponse(prev => prev + words[i] + " ");
        await new Promise(r => setTimeout(r, 50)); // Typing speed
      }
    } else {
      setResponse(fakeAIResponse);
    }

    // 4. LOG THE EXPERIMENT (Teacher Supervision)
    // We save what the student typed so the teacher can review it later.
    try {
      if (auth.currentUser) {
        await addDoc(collection(db, "experiments"), {
          uid: auth.currentUser.uid,
          prompt: prompt,
          response: fakeAIResponse,
          type: mode,
          timestamp: serverTimestamp()
        });
      }
    } catch (e) {
      console.error("Tracking failed", e);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans flex flex-col">
      
      {/* --- HEADER --- */}
      <header className="border-b border-white/10 bg-[#0A0A0A] p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="hover:bg-white/10 p-2 rounded-lg transition-all">
            ← Back
          </button>
          <div>
            <h1 className="font-bold text-lg flex items-center gap-2">
              <span className="text-blue-400">⚡</span> The Lab
            </h1>
            <p className="text-xs text-gray-500">Sandbox Environment • v1.0</p>
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

          {/* Image Output */}
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