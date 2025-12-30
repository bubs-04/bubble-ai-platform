"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { useRouter } from "next/navigation";
import TeacherDashboard from "@/components/TeacherDashboard";
import StudentDashboard from "@/components/StudentDashboard";
import { UserProfile } from "@/types";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch Role from DB
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        router.push("/");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white">Loading Portal...</div>;
  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="font-bold text-xl text-gray-800">BubbleAI <span className="text-gray-400 font-normal text-sm">| {profile.schoolId === 'demo_school' ? 'Demo Campus' : 'Portal'}</span></div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full capitalize">{profile.role}</span>
          <button onClick={() => { signOut(auth); router.push("/"); }} className="text-sm text-red-500 hover:text-red-700 font-medium">Sign Out</button>
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto">
        {profile.role === 'teacher' ? (
          <TeacherDashboard user={user} schoolId={profile.schoolId} />
        ) : (
          <StudentDashboard schoolId={profile.schoolId} studentName={profile.displayName} />
        )}
      </main>
    </div>
  );
}