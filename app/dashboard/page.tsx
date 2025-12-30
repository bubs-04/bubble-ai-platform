"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore"; 
import { useRouter } from "next/navigation";
import { checkOrCreateUser } from "@/lib/db";
import AiTutor from "@/components/AiTutor";
import TeacherDashboard from "@/components/TeacherDashboard";
import QuizModal from "@/components/QuizModal";
import StudentReportCard from "@/components/StudentReportCard";
import JoinClassModal from "@/components/JoinClassModal";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [schoolName, setSchoolName] = useState("BubbleAi Portal");
  const [loading, setLoading] = useState(true);
  
  // Curriculum State
  const [weeks, setWeeks] = useState<any[]>([]);
  
  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<{ questions: any[], weekId: string } | null>(null); 

  // Student Tab State
  const [studentTab, setStudentTab] = useState("lessons");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser);
      } else {
        router.push("/");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const loadUserProfile = async (currentUser: User) => {
    const profile = await checkOrCreateUser(currentUser);
    setUserProfile(profile);

    // Fetch School Name if enrolled
    if (profile.schoolId) {
      try {
        const schoolSnap = await getDoc(doc(db, "schools", profile.schoolId));
        if (schoolSnap.exists()) {
          setSchoolName(schoolSnap.data().name);
        }
      } catch (err) { console.error(err); }
    }

    if (profile.role === "student" || profile.role === "teacher") {
       // Hardcoded to 'grade_6' for now, later we fetch based on class
       fetchCurriculum("grade_6", profile.schoolId);
    }
  };
  const fetchCurriculum = async (gradeId: string, schoolId?: string) => {
    try {
      let weeksRef;

      if (schoolId) {
        weeksRef = collection(db, "schools", schoolId, "curriculum", gradeId, "weeks");
      } else {
        weeksRef = collection(db, "curriculum", gradeId, "weeks");
      }

      const q = query(weeksRef, orderBy("order"));
      const snapshot = await getDocs(q);
      setWeeks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching curriculum:", error);
    }
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-700">Loading your school portal...</h2>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) return null; 

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50 relative">
      
      {/* --- QUIZ MODAL --- */}
      {activeQuiz && user && (
        <QuizModal 
          questions={activeQuiz.questions} 
          weekId={activeQuiz.weekId}
          studentId={user.uid}
          onClose={() => setActiveQuiz(null)} 
        />
      )}
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{schoolName}</h1>
          <div className="flex gap-2 mt-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">
              {userProfile.role}
            </span>
            {userProfile.schoolId && (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                Authorized
              </span>
            )}
          </div>
        </div>
        <button onClick={handleLogout} className="bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 font-medium px-4 py-2 rounded-lg">
          Sign Out
        </button>
      </div>

      {/* --- LOGIC SPLIT --- */}
      
      {/* 1. TEACHER VIEW */}
      {userProfile.role === "teacher" || userProfile.role === "school_admin" ? (
        <TeacherDashboard user={user} schoolId={userProfile.schoolId} />
      ) : (
        
        // 2. STUDENT VIEW
        <>
          {/* CHECK: IS STUDENT IN A CLASS? */}
          {(!userProfile.classIds || userProfile.classIds.length === 0) ? (
            
            // SHOW JOIN MODAL IF "HOMELESS"
            <JoinClassModal 
              studentId={user.uid} 
              onJoinSuccess={() => {
                setLoading(true);
                loadUserProfile(user); 
                setLoading(false);
              }} 
            />

          ) : (

            // SHOW DASHBOARD IF ENROLLED
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: MAIN CONTENT */}
              <div className="lg:col-span-2 space-y-6">
                  
                  {/* WELCOME CARD + TABS */}
                  <div className="bg-white p-8 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-1">👋 Welcome, {userProfile.displayName}!</h2>
                      <p className="text-gray-600">Let's continue your journey.</p>
                    </div>
                    
                    {/* TABS SWITCHER */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button 
                        onClick={() => setStudentTab("lessons")}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${studentTab === "lessons" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        📚 Lessons
                      </button>
                      <button 
                        onClick={() => setStudentTab("grades")}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${studentTab === "grades" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        📊 Report Card
                      </button>
                    </div>
                  </div>

                  {/* TAB CONTENT: LESSONS */}
                  {studentTab === "lessons" ? (
                    <>
                      {/* --- 🧪 THE LAB ENTRY CARD (NEW) --- */}
                      <div 
                        onClick={() => router.push("/dashboard/lab")}
                        className="bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-700 p-6 rounded-xl flex items-center justify-between group cursor-pointer shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]" 
                      >
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                            🧪 Enter The Lab
                            <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">New</span>
                          </h3>
                          <p className="text-blue-100/80 text-sm max-w-md">
                            Access the Generative AI Sandbox. Test prompts, generate art, and build your portfolio.
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all">
                          <span className="text-2xl">⚡</span>
                        </div>
                      </div>
                      {/* --- END LAB CARD --- */}

                      {weeks.length === 0 ? (
                        <p className="text-gray-500 italic mt-6">No lessons published yet.</p>
                      ) : (
                        weeks.map((week) => (
                          <div key={week.id} className={`mb-6 border rounded-xl overflow-hidden shadow-sm transition-all ${week.isPublished ? "bg-white" : "bg-gray-50 opacity-75"}`}>
                            
                            <div className={`p-4 flex justify-between items-center ${week.isPublished ? "bg-blue-600" : "bg-gray-200"}`}>
                              <h3 className={`font-bold text-lg ${week.isPublished ? "text-white" : "text-gray-500"}`}>
                                Week {week.order}: {week.title}
                              </h3>
                              {week.isPublished ? <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Open</span> : <span className="flex items-center gap-1 bg-gray-300 text-gray-600 text-xs px-2 py-1 rounded font-bold">🔒 Locked</span>}
                            </div>
                            
                            {week.isPublished ? (
                              <div className="p-6">
                                <p className="text-gray-700 mb-4">{week.content}</p>
                                {week.videoUrl && (
                                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black mb-6 shadow-inner">
                                    <iframe src={week.videoUrl} className="w-full h-full" title="Lesson Video" allowFullScreen></iframe>
                                  </div>
                                )}

                                <div className="flex gap-3">
                                  <button 
                                    onClick={() => router.push(`/lab/${week.id}`)}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-sm transition-transform active:scale-95"
                                  >
                                    Start Assignment
                                  </button>
                                  
                                  {week.quiz && week.quiz.length > 0 ? (
                                    <button 
                                      onClick={() => setActiveQuiz({ questions: week.quiz, weekId: week.id })}
                                      className="bg-indigo-50 text-indigo-700 px-6 py-2 rounded-lg font-bold hover:bg-indigo-100 border border-indigo-200"
                                    >
                                      Take Quiz ({week.quiz.length} Qs)
                                    </button>
                                  ) : (
                                    <button disabled className="bg-gray-50 text-gray-400 px-6 py-2 rounded-lg font-bold cursor-not-allowed">
                                      No Quiz Yet
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="p-8 text-center">
                                <div className="text-4xl mb-2 opacity-30">🔒</div>
                                <p className="text-gray-400 font-medium">This content is locked.</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </>
                  ) : (
                    // TAB CONTENT: REPORT CARD
                    <StudentReportCard studentId={user.uid} />
                  )}
              </div>

              {/* RIGHT: AI TUTOR */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden sticky top-8">
                  <div className="bg-indigo-600 p-4 text-white">
                    <h3 className="font-bold text-lg">AI Assistant</h3>
                    <p className="text-indigo-100 text-sm">Stuck? Ask me anything!</p>
                  </div>
                  <div className="p-4">
                      <AiTutor /> 
                  </div>
                </div>
              </div>

            </div>
          )}
        </>
      )}
    </div>
  );
}