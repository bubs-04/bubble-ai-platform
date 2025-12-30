"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import AiTutor from "@/components/AiTutor"; 
import SubmitAssignmentModal from "@/components/SubmitAssignmentModal"; // <--- IMPORT

export default function LabPage({ params }: { params: { weekId: string } }) {
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // <--- Track User
  const [showSubmit, setShowSubmit] = useState(false); // <--- Track Modal
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }
      setCurrentUser(user); // Save user

      // Fetch Lesson
      const docRef = doc(db, "curriculum", "grade_6", "weeks", params.weekId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLesson(docSnap.data());
      } else {
        alert("Assignment not found!");
        router.push("/dashboard");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.weekId, router]);

  if (loading) return <div className="p-12 text-center">Loading Lab Environment...</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden relative">
      
      {/* --- SUBMISSION MODAL --- */}
      {showSubmit && currentUser && (
        <SubmitAssignmentModal 
          weekId={params.weekId}
          studentId={currentUser.uid}
          onClose={() => setShowSubmit(false)}
        />
      )}

      {/* NAVBAR */}
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 font-bold">
            ← Exit Lab
          </button>
          <div className="h-6 w-px bg-gray-200"></div>
          <h1 className="font-bold text-gray-800">
            Week {lesson?.order}: {lesson?.title}
          </h1>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold uppercase">
            Assignment Mode
          </span>
        </div>
        
        {/* SUBMIT BUTTON (UPDATED) */}
        <button 
          onClick={() => setShowSubmit(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 text-sm shadow-sm active:scale-95 transition-all"
        >
          Submit Project
        </button>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL */}
        <div className="w-1/3 bg-white border-r overflow-y-auto p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📝 Your Mission</h2>
          
          <div className="prose prose-blue text-gray-600 text-sm">
            {lesson?.content ? (
              <p>{lesson.content}</p>
            ) : (
              <p>Follow the instructions in the video to complete this task using the AI tool on the right.</p>
            )}
            
            <hr className="my-6" />
            
            <h3 className="font-bold text-black mb-2">Success Criteria:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the AI to generate a creative solution.</li>
              <li>Test your prompt at least 3 times.</li>
              <li>Copy your best result to the clipboard.</li>
            </ul>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-2/3 bg-gray-50 flex flex-col relative">
          <div className="bg-white border-b px-4 py-2 flex items-center gap-2 text-sm text-gray-500">
             <span>Tool:</span>
             <select className="border rounded px-2 py-1 bg-gray-50 font-bold text-gray-700">
               <option>Gemini 1.5 Flash (Text)</option>
               <option disabled>DALL-E 3 (Image) - Locked</option>
             </select>
          </div>

          <div className="flex-1 p-4 overflow-hidden">
             <div className="bg-white rounded-xl shadow-sm border h-full overflow-hidden flex flex-col">
               <div className="flex-1 overflow-y-auto p-4">
                 <AiTutor />
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}