"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from "firebase/firestore";
import { UserProfile, Classroom, Lesson } from "@/types";

export default function TeacherDashboard({ user }: { user: UserProfile }) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);

  // 1. Load Classes
  useEffect(() => {
    const loadClasses = async () => {
      // In a real app, we filter by teacherId. For demo, we fetch all demo classes.
      const q = query(collection(db, "classrooms"), where("schoolId", "==", user.schoolId || "demo_school"));
      const snap = await getDocs(q);
      setClassrooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Classroom)));
    };
    loadClasses();
  }, [user]);

  // 2. Load Class Content
  const openClass = async (classId: string) => {
    setSelectedClass(classId);
    
    // Fetch Lessons
    const lQ = query(collection(db, "classrooms", classId, "lessons"), orderBy("weekOrder"));
    const lSnap = await getDocs(lQ);
    setLessons(lSnap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson)));

    // Fetch Students (Pending & Approved)
    const sQ = query(collection(db, "users"), where("classIds", "array-contains", classId));
    const sSnap = await getDocs(sQ);
    setStudents(sSnap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile)));
  };

  const togglePublish = async (lessonId: string, current: boolean) => {
    if(!selectedClass) return;
    await updateDoc(doc(db, "classrooms", selectedClass, "lessons", lessonId), { isPublished: !current });
    setLessons(lessons.map(l => l.id === lessonId ? { ...l, isPublished: !current } : l));
  };

  const approveStudent = async (studentId: string) => {
    await updateDoc(doc(db, "users", studentId), { approved: true });
    setStudents(students.map(s => s.uid === studentId ? { ...s, approved: true } : s));
  };

  return (
    <div>
      {!selectedClass ? (
        <div className="grid gap-6">
          <h2 className="text-2xl font-bold">Your Classrooms</h2>
          {classrooms.map(c => (
             <button key={c.id} onClick={() => openClass(c.id)} className="bg-white p-6 rounded-xl border text-left hover:border-blue-500 transition-all shadow-sm">
                <h3 className="text-xl font-bold text-blue-600">{c.name}</h3>
                <p className="text-gray-500">Student Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{c.classCode}</span></p>
             </button>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <button onClick={() => setSelectedClass(null)} className="text-gray-500 hover:text-black">← Back to Classes</button>
          
          {/* SYLLABUS MANAGER */}
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold text-lg mb-4">📚 Syllabus Manager</h3>
            <div className="space-y-4">
              {lessons.map(l => (
                <div key={l.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <span className="text-xs font-bold uppercase text-gray-400">Week {l.weekOrder} • {l.type}</span>
                    <h4 className="font-bold">{l.title}</h4>
                  </div>
                  <button onClick={() => togglePublish(l.id, l.isPublished)} className={`px-4 py-2 rounded-lg font-bold text-sm ${l.isPublished ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                    {l.isPublished ? "Published" : "Draft"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* STUDENT ROSTER */}
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold text-lg mb-4">👥 Student Roster</h3>
            <div className="space-y-2">
              {students.map(s => (
                <div key={s.uid} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${s.approved ? "bg-green-500" : "bg-yellow-500"}`}></div>
                    <span>{s.displayName}</span>
                  </div>
                  {!s.approved && (
                    <button onClick={() => approveStudent(s.uid)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full">Approve</button>
                  )}
                </div>
              ))}
              {students.length === 0 && <p className="text-gray-400">No students joined yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}