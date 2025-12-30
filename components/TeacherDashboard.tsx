"use client";

import { useState, useEffect } from "react";
import { createClassroom, getTeacherClasses } from "@/lib/db";
import { User } from "firebase/auth";
import AdminCurriculum from "@/components/AdminCurriculum";
import TeacherGradebook from "@/components/TeacherGradebook"; 

// UPDATE 1: Add schoolId to the interface
export default function TeacherDashboard({ user, schoolId }: { user: User, schoolId: string }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("classes"); 
  
  // Form State
  const [className, setClassName] = useState("");
  const [grade, setGrade] = useState("6");

  useEffect(() => {
    loadClasses();
  }, [user]);

  const loadClasses = async () => {
    const myClasses = await getTeacherClasses(user.uid);
    setClasses(myClasses);
  };

  const handleCreateClass = async () => {
    if (!schoolId) {
      alert("Error: No School ID found for this teacher.");
      return;
    }
    setIsCreating(true);
    // UPDATE 2: Use the real schoolId instead of "demo_school"
    await createClassroom(user.uid, schoolId, className, Number(grade));
    setIsCreating(false);
    setClassName("");
    loadClasses();
  };

  return (
    <div className="space-y-8">
      
      {/* TABS NAVIGATION */}
      <div className="flex space-x-4 border-b">
        <button 
          onClick={() => setActiveTab("classes")}
          className={`pb-2 px-4 font-bold ${activeTab === "classes" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          My Classes
        </button>
        <button 
          onClick={() => setActiveTab("curriculum")}
          className={`pb-2 px-4 font-bold ${activeTab === "curriculum" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Curriculum Manager
        </button>
        <button 
          onClick={() => setActiveTab("gradebook")}
          className={`pb-2 px-4 font-bold ${activeTab === "gradebook" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Gradebook
        </button>
      </div>

      {/* TAB 1: CLASSES */}
      {activeTab === "classes" && (
        <>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold mb-4">Create a New Class</h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Class Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. 6-B Computer Science"
                  className="w-full p-2 border rounded"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium mb-1">Grade</label>
                <select 
                  className="w-full p-2 border rounded bg-white"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  {[6, 7, 8, 9, 10].map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>
              <button 
                onClick={handleCreateClass}
                disabled={isCreating || !className}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create Class"}
              </button>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-700">My Active Classes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                <h4 className="text-xl font-bold text-gray-800 mb-1">{cls.name}</h4>
                <p className="text-sm text-gray-500 mb-4">Grade {cls.grade} • {cls.studentIds?.length || 0} Students</p>
                <div className="bg-white p-3 rounded-lg border border-dashed border-blue-300 text-center">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Class Key</p>
                  <p className="text-2xl font-mono font-bold text-blue-600 tracking-widest select-all">{cls.classKey}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TAB 2: CURRICULUM */}
      {activeTab === "curriculum" && (
        <div className="max-w-2xl">
          <AdminCurriculum />
        </div>
      )}

      {/* TAB 3: GRADEBOOK */}
      {activeTab === "gradebook" && (
        <div className="max-w-5xl">
          <TeacherGradebook />
        </div>
      )}

    </div>
  );
}