"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";

export default function MasterDashboard({ user }: { user: any }) {
  
  // --- THE "BIG BANG" BUTTON ---
  // This creates the Demo School, Class 6A, and the Syllabus in one click.
  const deployDemo = async () => {
    if(!confirm("Create Demo School & Content?")) return;
    
    try {
      // 1. Create School
      await setDoc(doc(db, "schools", "demo_school"), {
        name: "Little Buds International",
        brandingColor: "#FF5733",
        subscriptionActive: true
      });

      // 2. Create Class 6A (Teacher will be assigned later)
      const classRef = await addDoc(collection(db, "classrooms"), {
        name: "6A - Computer Science",
        schoolId: "demo_school",
        classCode: "BUBBLE-6A", // Students use this to join
        teacherId: "" 
      });

      // 3. Create Master Syllabus (Weeks 1-3)
      const weeks = [
        { weekOrder: 1, title: "Intro to AI", type: "lecture", isPublished: true, content: "What is AI?", videoUrl: "https://www.youtube.com/embed/ad79nYk2keg" },
        { weekOrder: 1, title: "Lab 1: Image Gen", type: "lab", aiTool: "image-gen", isPublished: true, content: "Generate a futuristic animal." },
        { weekOrder: 2, title: "Neural Networks", type: "lecture", isPublished: false, content: "How brains work." }
      ];

      // Inject into the new Class
      for (const week of weeks) {
        await addDoc(collection(db, "classrooms", classRef.id, "lessons"), week);
      }

      alert(`✅ System Deployed!\nSchool: Little Buds\nClass: 6A\nStudent Code: BUBBLE-6A`);
    } catch (e) { console.error(e); alert("Error deploying."); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-black text-white p-8 rounded-2xl">
        <h1 className="text-3xl font-bold">Master Control</h1>
        <p className="opacity-70">Manage Schools, Clients, and Global Content.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold text-lg mb-4">🚀 Quick Actions</h3>
          <button onClick={deployDemo} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-500">
            Deploy Demo Ecosystem
          </button>
          <p className="text-xs text-gray-500 mt-2">Creates: Demo School, Class 6A, 3 Weeks of Content.</p>
        </div>
      </div>
    </div>
  );
}