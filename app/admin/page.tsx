"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, writeBatch, doc } from "firebase/firestore"; 
import { useRouter } from "next/navigation";

// --- TYPE DEFINITIONS ---
interface School {
  id: string;
  name: string;
  adminEmail: string;
  studentCount: number;
  plan: string;
  isActive: boolean;
  maxStudents: number; // <--- This was the missing key!
}

export default function GodMode() {
  const [schools, setSchools] = useState<School[]>([]);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [studentLimit, setStudentLimit] = useState(500);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/"); 
        return;
      }
      fetchSchools();
    });
    return () => unsubscribe();
  }, [router]);

  const fetchSchools = async () => {
    try {
      const q = query(collection(db, "schools"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
      setSchools(data);
    } catch (err) {
      console.error("Error fetching schools:", err);
    } finally {
      setLoading(false);
    }
  };

  const deployCurriculum = async (schoolId: string) => {
    const batch = writeBatch(db);
    
    // Clone Grade 6
    const masterRef6 = collection(db, "curriculum_master", "grade_6", "weeks");
    const snapshot6 = await getDocs(masterRef6);
    
    if (!snapshot6.empty) {
      snapshot6.forEach((week) => {
        const targetRef = doc(db, "schools", schoolId, "curriculum", "grade_6", "weeks", week.id);
        batch.set(targetRef, week.data());
      });
    }
    
    await batch.commit();
    console.log(`✅ Curriculum deployed to ${schoolId}`);
  };

  const handleOnboardSchool = async () => {
    if (!newSchoolName || !adminEmail) return;
    setLoading(true);

    try {
      const schoolRef = await addDoc(collection(db, "schools"), {
        name: newSchoolName,
        adminEmail: adminEmail,
        studentCount: 0,
        maxStudents: Number(studentLimit),
        plan: "enterprise_yearly",
        isActive: true,
        createdAt: serverTimestamp(),
        region: "IN"
      });

      await deployCurriculum(schoolRef.id);

      alert(`🚀 ${newSchoolName} is LIVE! ID: ${schoolRef.id}`);
      setNewSchoolName("");
      setAdminEmail("");
      fetchSchools();
    } catch (e) {
      console.error(e);
      alert("Error onboarding school.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white">Accessing Mainframe...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* NAVBAR */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <h1 className="text-xl font-bold tracking-tight">BubbleHQ <span className="text-gray-500 font-normal">| Administrator</span></h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Server Status: <span className="text-green-400">Online</span></span>
            <button onClick={() => signOut(auth)} className="hover:text-white transition-colors">Logout</button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: ONBOARDING */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-1">⚡ Onboard New School</h2>
            <p className="text-gray-400 text-sm mb-6">Create a tenant and deploy curriculum.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">School Name</label>
                <input 
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. Greenwood High"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Principal Email</label>
                <input 
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="principal@school.edu"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Student License Limit</label>
                <input 
                  type="number"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={studentLimit}
                  onChange={(e) => setStudentLimit(Number(e.target.value))}
                />
              </div>

              <button 
                onClick={handleOnboardSchool}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex justify-center items-center gap-2"
              >
                <span>🚀 Launch School</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CLIENTS */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-end mb-6">
             <div>
               <h2 className="text-2xl font-bold">Active Clients</h2>
               <p className="text-gray-400">Total Revenue Run Rate: <span className="text-green-400">${schools.length * 7500}/yr</span></p>
             </div>
          </div>

          <div className="grid gap-4">
            {schools.map((school) => (
              <div key={school.id} className="bg-gray-800 border border-gray-700 p-5 rounded-xl flex items-center justify-between group hover:border-gray-600 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-lg font-bold">
                    {school.name.substring(0,1)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{school.name}</h3>
                    <p className="text-sm text-gray-400">{school.adminEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold">Students</p>
                    <p className="font-mono text-white">{school.studentCount} / {school.maxStudents}</p>
                  </div>
                  <div className="h-8 w-[1px] bg-gray-700"></div>
                  <button className="text-blue-400 hover:text-white text-sm font-bold">Manage</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}