"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Certificate from "@/components/Certificate"; // <--- IMPORT

export default function StudentReportCard({ studentId }: { studentId: string }) {
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageScore, setAverageScore] = useState(0);
  const [studentName, setStudentName] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!studentId) return;

      try {
        // 0. Get Student Name (for the certificate)
        const userDoc = await getDoc(doc(db, "users", studentId));
        if (userDoc.exists()) {
           setStudentName(userDoc.data().displayName || "Student");
        }

        // 1. Fetch Quiz Scores
        const quizSnap = await getDocs(collection(db, "users", studentId, "grades"));
        const quizzes: any = {};
        quizSnap.forEach(doc => {
          quizzes[doc.id] = doc.data(); 
        });

        // 2. Fetch Assignment Grades
        const assignSnap = await getDocs(collection(db, "users", studentId, "assignments"));
        const assignments: any = {};
        assignSnap.forEach(doc => {
          assignments[doc.id] = doc.data();
        });

        // 3. Merge data
        const allWeekIds = new Set([...Object.keys(quizzes), ...Object.keys(assignments)]);
        
        let totalScore = 0;
        let count = 0;

        const merged = Array.from(allWeekIds).map(weekId => {
          const q = quizzes[weekId];
          const a = assignments[weekId];
          
          // Calculate running average for this week
          if (q) { totalScore += q.percentage; count++; }
          if (a && a.grade) { totalScore += a.grade; count++; }

          return {
            weekId,
            quiz: q || null,
            assignment: a || null
          };
        });

        if (count > 0) {
          setAverageScore(Math.round(totalScore / count));
        }

        setReportData(merged.sort((a, b) => a.weekId.localeCompare(b.weekId)));
      } catch (e) {
        console.error("Error fetching grades:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [studentId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your grades...</div>;

  return (
    <div className="space-y-6">
      
      {/* --- SHOW CERTIFICATE OVERLAY --- */}
      {showCertificate && (
        <Certificate 
          studentName={studentName} 
          courseName="Data Science & AI 101" 
          date={new Date().toLocaleDateString()} 
        />
      )}

      {/* GPA HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">📊 Overall GPA</h2>
          <p className="text-blue-100 opacity-80">Keep your average above 60% to graduate.</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold">{averageScore}%</div>
          {averageScore >= 60 ? (
             <span className="bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded">PASSING</span>
          ) : (
             <span className="bg-red-400 text-red-900 text-xs font-bold px-2 py-1 rounded">NEEDS WORK</span>
          )}
        </div>
      </div>

      {/* CERTIFICATE UNLOCKER */}
      {averageScore >= 60 && reportData.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 flex items-center justify-between">
           <div>
             <h3 className="font-bold text-yellow-800 text-lg">🎉 Congratulations!</h3>
             <p className="text-yellow-700 text-sm">You have met the requirements for graduation.</p>
           </div>
           <button 
             onClick={() => setShowCertificate(true)}
             className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-transform active:scale-95 flex items-center gap-2"
           >
             🎓 Claim Diploma
           </button>
        </div>
      )}

      {/* GRADES LIST */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {reportData.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p>No grades recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y">
            {reportData.map((item) => (
              <div key={item.weekId} className="p-6 hover:bg-gray-50 transition-colors">
                 <div className="flex items-center gap-3 mb-4">
                   <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
                     Week {item.assignment?.weekId || item.weekId}
                   </span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Quiz */}
                   <div className="border rounded-lg p-4 bg-white border-l-4 border-l-purple-400">
                     <h4 className="font-bold text-gray-700 text-sm mb-2">🧠 Quiz Score</h4>
                     {item.quiz ? (
                       <span className="text-xl font-bold text-gray-800">{item.quiz.percentage}%</span>
                     ) : <span className="text-gray-400 italic text-sm">Not taken</span>}
                   </div>
                   {/* Assignment */}
                   <div className="border rounded-lg p-4 bg-white border-l-4 border-l-orange-400">
                     <h4 className="font-bold text-gray-700 text-sm mb-2">📝 Project Grade</h4>
                     {item.assignment ? (
                       <span className="text-xl font-bold text-gray-800">{item.assignment.grade || "Pending"}</span>
                     ) : <span className="text-gray-400 italic text-sm">Not submitted</span>}
                   </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}