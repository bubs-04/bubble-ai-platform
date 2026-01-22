"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { UserProfile, Lesson } from "@/types";
import AiLabModal from "./AiLabModal"; // Uses the same modal we built earlier

export default function StudentDashboard({ user }: { user: UserProfile }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [labOpen, setLabOpen] = useState(false);

  useEffect(() => {
    const loadFeed = async () => {
      if (!user.classIds || user.classIds.length === 0) return;
      // Fetch lessons from their first class
      const q = query(collection(db, "classrooms", user.classIds[0], "lessons"), orderBy("weekOrder"));
      const snap = await getDocs(q);
      // Only show published
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson));
      setLessons(all.filter(l => l.isPublished));
    };
    if (user.approved) loadFeed();
  }, [user]);

  if (!user.approved) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold">Pending Approval</h2>
        <p className="text-gray-500">Your teacher needs to accept your join request.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {labOpen && <AiLabModal onClose={() => setLabOpen(false)} studentName={user.displayName} />}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-2xl mb-8 shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Hello, {user.displayName}</h1>
          <p className="opacity-90">Ready to learn?</p>
        </div>
        <button onClick={() => setLabOpen(true)} className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
          🧪 Open AI Lab
        </button>
      </div>

      <div className="space-y-6">
        {lessons.map(l => (
          <div key={l.id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
            {l.videoUrl && (
              <div className="aspect-video bg-black">
                <iframe src={l.videoUrl} className="w-full h-full" allowFullScreen></iframe>
              </div>
            )}
            <div className="p-6">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{l.type} • Week {l.weekOrder}</span>
              <h3 className="text-xl font-bold mt-1 mb-2">{l.title}</h3>
              <p className="text-gray-600">{l.description}</p>
              
              {l.type === 'lab' && (
                <button onClick={() => setLabOpen(true)} className="mt-4 w-full bg-gray-100 py-3 rounded-lg font-bold text-gray-700 hover:bg-gray-200">
                  Launch Lab Assignment
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}