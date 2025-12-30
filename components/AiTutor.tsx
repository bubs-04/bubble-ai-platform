"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import ReactMarkdown from "react-markdown";

export default function AiTutor() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAskAi = async () => {
    if (!query) return;
    
    setLoading(true);
    setAnswer(""); 

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: query }),
      });

      const data = await response.json();
      
      if (data.answer) {
        setAnswer(data.answer);
      } else {
        setAnswer("Sorry, I couldn't understand that. Try again!");
      }

    } catch (error) {
      console.error("Error:", error);
      setAnswer("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="text-xl font-bold mb-4">Ask the AI Tutor</h2>
      
      <textarea
        className="w-full p-3 border rounded-lg mb-4 h-32 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="What do you want to learn? (e.g., 'Explain Gravity')"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <Button 
        onClick={handleAskAi} 
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
      >
        {loading ? "Thinking..." : "Explain this to me"}
      </Button>

      {/* Answer Box */}
      {answer && (
        <div className="mt-6 p-6 bg-blue-50 border-l-4 border-blue-500 rounded text-gray-800">
          <h3 className="font-semibold text-blue-800 mb-4">AI Answer:</h3>
          
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown
              components={{
                // Make headings bold and bigger
                h1: ({...props}) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                h2: ({...props}) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                h3: ({...props}) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                // Make lists look like lists again
                ul: ({...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                ol: ({...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                // Add spacing to paragraphs
                p: ({...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                // Make bold text actually bold
                strong: ({...props}) => <strong className="font-bold text-blue-900" {...props} />,
              }}
            >
              {answer}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}