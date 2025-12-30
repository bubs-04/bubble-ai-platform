"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface SubmitModalProps {
  weekId: string;
  studentId: string;
  onClose: () => void;
}

export default function SubmitAssignmentModal({ weekId, studentId, onClose }: SubmitModalProps) {
  const [result, setResult] = useState("");
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!result || !reflection) {
      alert("Please fill in both fields.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save to: users -> studentID -> assignments -> weekID
      const assignmentRef = doc(db, "users", studentId, "assignments", weekId);
      
      await setDoc(assignmentRef, {
        weekId,
        studentId,
        content: result,
        reflection: reflection,
        submittedAt: serverTimestamp(),
        status: "submitted",
        grade: null // Teacher will fill this later
      });

      setSuccess(true);
      // Close after 2 seconds so they see the success message
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error("Error submitting:", error);
      alert("Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Assignment Sent!</h2>
          <p className="text-gray-500">Great work. Your teacher will review it soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
        
        <div className="bg-green-600 p-4 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg">📝 Submit Assignment</h2>
          <button onClick={onClose} className="hover:bg-green-700 p-1 rounded">✕</button>
        </div>

        <div className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Paste your Best AI Result
            </label>
            <textarea 
              rows={6}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Paste the text or code the AI generated for you here..."
              value={result}
              onChange={(e) => setResult(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Reflection: What did you learn?
            </label>
            <textarea 
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="I learned that..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            ></textarea>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            {isSubmitting ? "Sending..." : "Submit Project"}
          </button>

        </div>
      </div>
    </div>
  );
}