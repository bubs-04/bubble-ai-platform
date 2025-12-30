"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collectionGroup, query, where, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";

export default function TeacherGradebook() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  
  // Grading Inputs
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 1. LISTEN FOR PENDING SUBMISSIONS
  useEffect(() => {
    // "collectionGroup" searches ALL collections named 'assignments' in the whole DB
    const q = query(
      collectionGroup(db, "assignments"), 
      where("status", "==", "submitted")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const subs = snapshot.docs.map(doc => ({
        id: doc.id,
        refPath: doc.ref.path, // We need the path to update it later
        ...doc.data()
      }));

      // We need to fetch student names separately because the assignment 
      // only has studentId. This is a quick look-up.
      const subsWithNames = await Promise.all(subs.map(async (sub: any) => {
         const userRef = doc(db, "users", sub.studentId);
         const userSnap = await getDoc(userRef);
         return {
           ...sub,
           studentName: userSnap.exists() ? userSnap.data().displayName : "Unknown Student"
         };
      }));

      setSubmissions(subsWithNames);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. SUBMIT GRADE
  const handleGradeSubmit = async () => {
    if (!selectedSubmission || !grade) return;
    setIsSaving(true);

    try {
      // Create a reference to the specific document using the path we saved
      const assignmentRef = doc(db, selectedSubmission.refPath);

      await updateDoc(assignmentRef, {
        grade: Number(grade),
        feedback: feedback,
        status: "graded" // This removes it from the "Pending" list
      });

      // Reset UI
      setSelectedSubmission(null);
      setGrade("");
      setFeedback("");
    } catch (error) {
      console.error("Error grading:", error);
      alert("Error saving grade.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading submissions...</div>;

  return (
    <div className="flex h-[600px] border rounded-xl overflow-hidden bg-white shadow-sm">
      
      {/* LEFT COLUMN: THE INBOX */}
      <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
        <div className="p-4 border-b bg-white sticky top-0">
          <h2 className="font-bold text-gray-700">Inbox ({submissions.length})</h2>
        </div>
        
        {submissions.length === 0 ? (
          <p className="p-8 text-sm text-gray-400 text-center">🎉 All caught up! No pending work.</p>
        ) : (
          submissions.map((sub) => (
            <div 
              key={sub.id}
              onClick={() => setSelectedSubmission(sub)}
              className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${selectedSubmission?.id === sub.id ? "bg-white border-l-4 border-l-blue-600 shadow-inner" : ""}`}
            >
              <h3 className="font-bold text-gray-800 text-sm">{sub.studentName}</h3>
              <p className="text-xs text-gray-500 mb-1">Week {sub.weekId}</p>
              <div className="flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                 <span className="text-xs text-orange-600 font-bold">Needs Grading</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* RIGHT COLUMN: GRADING PANEL */}
      <div className="w-2/3 flex flex-col bg-white">
        {selectedSubmission ? (
          <>
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-start bg-gray-50">
               <div>
                 <h2 className="text-xl font-bold text-gray-800">{selectedSubmission.studentName}</h2>
                 <p className="text-sm text-gray-500">Submitted: {selectedSubmission.submittedAt?.toDate().toLocaleDateString()}</p>
               </div>
               <button 
                 onClick={() => setSelectedSubmission(null)}
                 className="text-gray-400 hover:text-gray-600"
               >✕</button>
            </div>

            {/* Student Work */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-xs font-bold text-blue-600 uppercase mb-2">Student Reflection</h3>
                <p className="text-gray-800 italic">"{selectedSubmission.reflection}"</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">AI Output Submission</h3>
                <div className="bg-gray-100 p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap text-gray-700">
                  {selectedSubmission.content}
                </div>
              </div>

            </div>

            {/* Grading Footer */}
            <div className="p-6 border-t bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
               <div className="flex-1">
                 <label className="block text-xs font-bold text-gray-500 mb-1">Feedback Comment</label>
                 <input 
                   type="text" 
                   className="w-full p-2 border rounded text-sm"
                   placeholder="Great job! Next time try..."
                   value={feedback}
                   onChange={(e) => setFeedback(e.target.value)}
                 />
               </div>
               <div className="flex gap-4 items-end">
                 <div className="w-20">
                   <label className="block text-xs font-bold text-gray-500 mb-1">Grade</label>
                   <input 
                     type="number" 
                     className="w-full p-2 border rounded text-sm font-bold text-center"
                     placeholder="100"
                     value={grade}
                     onChange={(e) => setGrade(e.target.value)}
                   />
                 </div>
                 <button 
                   onClick={handleGradeSubmit}
                   disabled={isSaving}
                   className="bg-green-600 text-white font-bold px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                 >
                   {isSaving ? "Returning..." : "Return Grade"}
                 </button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
            <div className="text-6xl mb-4">👈</div>
            <p>Select a submission to grade</p>
          </div>
        )}
      </div>

    </div>
  );
}