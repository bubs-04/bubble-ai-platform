"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types";

// Import Role Components (We will create these next)
import MasterDashboard from "@/components/MasterDashboard";
import TeacherDashboard from "@/components/TeacherDashboard";
import StudentDashboard from "@/components/StudentDashboard";

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) setProfile(snap.data() as UserProfile);
      } else {
        router.push("/");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading Portal...</div>;
  if (!profile) return null;

  // --- THE ROUTER ---
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
         <div className="font-bold text-xl">Bubble<span className="text-blue-600">AI</span> <span className="text-xs text-gray-400 ml-2">| {profile.role.toUpperCase()} PORTAL</span></div>
         <button onClick={() => signOut(auth)} className="text-red-500 text-sm font-bold">Sign Out</button>
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        {profile.role === "master" && <MasterDashboard user={profile} />}
        {profile.role === "teacher" && <TeacherDashboard user={profile} />}
        {profile.role === "student" && <StudentDashboard user={profile} />}
      </main>
    </div>
  );
}