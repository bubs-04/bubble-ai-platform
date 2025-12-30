"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Week, UserProfile } from "@/types";

export default function TeacherDashboard({ user, schoolId }: { user: any, schoolId: string }) {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Curriculum
  useEffect(() => {
    const fetchWeeks = async () => {
      if (!schoolId) return;
      const q = query(collection(db, "schools", schoolId, "curriculum", "grade_6", "weeks"), orderBy("order"));
      const snap = await getDocs(q);
      setWeeks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Week)));
    };
    fetchWeeks();
  }, [schoolId]);

  // 2. TOGGLE PUBLISH (Lock/Unlock)
  const togglePublish = async (weekId: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "schools", schoolId, "curriculum", "grade_6", "weeks", weekId), {
      isPublished: !currentStatus
    });
    // Optimistic Update
    setWeeks(weeks.map(w => w.id === weekId ? { ...w, isPublished: !currentStatus } : w));
  };

  // 3. THE INSTALLER (Admin Tool)
  const installCurriculum = async () => {
    if(!confirm("Are you sure? This will add 3 weeks to the database.")) return;
    setLoading(true);
    
    const demoData = [
      { order: 1, title: "Intro to AI", content: "What is AI? History and Basics.", isPublished: true, videoUrl: "https://www.youtube.com/embed/ad79nYk2keg" },
      { order: 2, title: "Machine Learning", content: "Supervised vs Unsupervised Learning.", isPublished: false },
      { order: 3, title: "Ethics in AI", content: "Bias, Privacy, and Safety.", isPublished: false }
    ];

    try {
      for (const week of demoData) {
        await addDoc(collection(db, "schools", schoolId, "curriculum", "grade_6", "weeks"), { ...week, createdAt: serverTimestamp() });
      }
      alert("Installation Complete. Refresh page.");
      window.location.reload();
    } catch (e) { alert("Error installing."); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Curriculum Manager</h2>
          <p className="text-gray-500">Grade 6 • Computer Science</p>
        </div>
        <button onClick={installCurriculum} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-500">
           {loading ? "Installing..." : "🛠️ Install Syllabus"}
        </button>
      </div>

      <div className="grid gap-4">
        {weeks.length === 0 ? <p className="text-gray-500">No curriculum found. Click 'Install Syllabus'.</p> : weeks.map((week) => (
          <div key={week.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
             <div>
               <h3 className="font-bold text-lg">Week {week.order}: {week.title}</h3>
               <p className="text-sm text-gray-500">{week.isPublished ? "🟢 Live for Students" : "🔴 Locked"}</p>
             </div>
             <button 
               onClick={() => togglePublish(week.id, week.isPublished)}
               className={`px-4 py-2 rounded-lg font-bold text-sm ${week.isPublished ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
             >
               {week.isPublished ? "Lock Content" : "Publish Content"}
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}