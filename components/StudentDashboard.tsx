"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { Week } from "@/types";

export default function StudentDashboard({ schoolId, studentName }: { schoolId: string, studentName: string }) {
  const [weeks, setWeeks] = useState<Week[]>([]);

  useEffect(() => {
    const fetchWeeks = async () => {
      if (!schoolId) return;
      // Fetch ALL weeks, but we render locked ones differently
      const q = query(collection(db, "schools", schoolId, "curriculum", "grade_6", "weeks"), orderBy("order"));
      const snap = await getDocs(q);
      setWeeks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Week)));
    };
    fetchWeeks();
  }, [schoolId]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-2xl mb-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {studentName}</h1>
        <p className="opacity-90">Your learning journey continues.</p>
      </div>

      <div className="space-y-6">
        {weeks.length === 0 ? <p className="text-center text-gray-500">No lessons assigned yet.</p> : weeks.map((week) => (
          <div key={week.id} className={`border rounded-xl overflow-hidden transition-all ${week.isPublished ? "bg-white shadow-sm" : "bg-gray-50 opacity-60"}`}>
            <div className={`p-4 ${week.isPublished ? "bg-blue-50" : "bg-gray-100"} border-b flex justify-between items-center`}>
              <h3 className="font-bold text-gray-800">Week {week.order}: {week.title}</h3>
              {!week.isPublished && <span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded text-gray-500">LOCKED</span>}
            </div>
            
            {week.isPublished && (
              <div className="p-6">
                <p className="text-gray-700 mb-6 leading-relaxed">{week.content}</p>
                {week.videoUrl && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-inner">
                     <iframe src={week.videoUrl} className="w-full h-full" allowFullScreen></iframe>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}