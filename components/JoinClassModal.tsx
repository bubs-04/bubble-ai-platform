"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";

interface JoinClassModalProps {
  studentId: string;
  onJoinSuccess: () => void;
}

export default function JoinClassModal({ studentId, onJoinSuccess }: JoinClassModalProps) {
  const [classKey, setClassKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!classKey) return;
    setLoading(true);
    setError("");

    // Trim spaces and force Uppercase to match DB
    const cleanKey = classKey.trim().toUpperCase();

    try {
      // FIX IS HERE: changed "classes" to "classrooms"
      const classesRef = collection(db, "classrooms"); 
      const q = query(classesRef, where("classKey", "==", cleanKey));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid Class Key. Check for typos.");
        setLoading(false);
        return;
      }

      const classDoc = querySnapshot.docs[0];
      const classData = classDoc.data();
      const classId = classDoc.id;
      const schoolId = classData.schoolId; // The link to the Organization

      if (!schoolId) {
        setError("Error: This class has no School ID attached.");
        setLoading(false);
        return;
      }

      // 2. Add Student to the Class Document (in "classrooms")
      await updateDoc(doc(db, "classrooms", classId), {
        studentIds: arrayUnion(studentId)
      });

      // 3. Update the Student's Profile
      await updateDoc(doc(db, "users", studentId), {
        schoolId: schoolId,          
        classIds: arrayUnion(classId) 
      });

      alert(`Successfully joined ${classData.name}! 🎉`);
      onJoinSuccess();
      
    } catch (err) {
      console.error(err);
      setError("System Error joining class.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          🎓
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Join Your Classroom</h2>
        <p className="text-gray-500 mb-6">Enter the class code (e.g. A1B-C2D)</p>
        
        <input 
          type="text" 
          placeholder="A1B-C2D"
          className="w-full text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg p-3 uppercase focus:border-blue-500 focus:outline-none mb-4"
          value={classKey}
          onChange={(e) => setClassKey(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm font-bold mb-4">{error}</p>}

        <button 
          onClick={handleJoin}
          disabled={loading || classKey.length < 3} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? "Joining..." : "Enter Classroom"}
        </button>
      </div>
    </div>
  );
}