"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function AdminCurriculum() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [weeks, setWeeks] = useState<any[]>([]);

  // Basic Form State
  const [grade, setGrade] = useState("grade_6");
  const [weekNumber, setWeekNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");

  // --- NEW: QUIZ STATE ---
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [correctOption, setCorrectOption] = useState("0"); // Index 0-3

  // 1. LISTEN TO DATABASE
  useEffect(() => {
    const q = query(collection(db, "curriculum", grade, "weeks"), orderBy("order"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const weeksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWeeks(weeksData);
    });
    return () => unsubscribe();
  }, [grade]);

  // 2. HELPER: Add a Question to the local list
  const addQuestionToDraft = () => {
    if (!currentQuestion || !option1 || !option2) {
      alert("Please enter a question and at least 2 options.");
      return;
    }
    const newQ = {
      question: currentQuestion,
      options: [option1, option2, option3, option4].filter(o => o !== ""), // Remove empty
      correctAnswer: Number(correctOption)
    };
    setQuizQuestions([...quizQuestions, newQ]);
    
    // Reset Question Form
    setCurrentQuestion("");
    setOption1(""); setOption2(""); setOption3(""); setOption4("");
    setCorrectOption("0");
  };

  const handlePublish = async () => {
    if (!weekNumber || !title || !content) {
      alert("Please fill in the basics (Week #, Title, Content)");
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    try {
      await addDoc(collection(db, "curriculum", grade, "weeks"), {
        order: Number(weekNumber),
        title,
        description: description || "",
        content,
        videoUrl: videoUrl || "",
        quiz: quizQuestions, // <--- SAVING THE QUIZ
        isPublished: false,
        createdAt: serverTimestamp(),
      });

      setStatus("✅ Draft Created with Quiz!");
      // Clear Form
      setTitle(""); setDescription(""); setContent(""); setVideoUrl("");
      setQuizQuestions([]); // Clear quiz
      setWeekNumber(String(Number(weekNumber) + 1));
    } catch (error: any) {
      console.error(error);
      setStatus("❌ Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (TogglePublish and HandleDelete are same as before) ...
  const togglePublish = async (weekId: string, currentStatus: boolean) => {
    const weekRef = doc(db, "curriculum", grade, "weeks", weekId);
    await updateDoc(weekRef, { isPublished: !currentStatus });
  };
  const handleDelete = async (weekId: string) => {
    if (confirm("Delete this lesson?")) {
      await deleteDoc(doc(db, "curriculum", grade, "weeks", weekId));
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: CREATE NEW */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">🎓 Add New Content</h2>
        </div>

        {status && (
          <div className={`p-3 rounded text-sm font-bold ${status.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {status}
          </div>
        )}

        {/* Basic Fields (Same as before) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Target Grade</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full p-2 border rounded bg-gray-50">
              <option value="grade_6">Grade 6</option>
              <option value="grade_7">Grade 7</option>
              <option value="grade_8">Grade 8</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Week Number</label>
            <input type="number" value={weekNumber} onChange={(e) => setWeekNumber(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. 3"/>
          </div>
        </div>
        
        <input type="text" placeholder="Lesson Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded" />
        <input type="text" placeholder="YouTube Embed URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full p-2 border rounded font-mono text-sm" />
        <textarea rows={3} placeholder="Lesson Content..." value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-2 border rounded" />

        {/* --- NEW: QUIZ BUILDER SECTION --- */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-2">🧠 Quiz Builder</h3>
          
          <div className="space-y-2 mb-4">
            <input 
              type="text" 
              placeholder="Question: e.g. What does AI stand for?"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="grid grid-cols-2 gap-2">
               <input type="text" placeholder="Option 1 (e.g. Artificial Intelligence)" value={option1} onChange={(e) => setOption1(e.target.value)} className="w-full p-2 border rounded text-sm"/>
               <input type="text" placeholder="Option 2" value={option2} onChange={(e) => setOption2(e.target.value)} className="w-full p-2 border rounded text-sm"/>
               <input type="text" placeholder="Option 3" value={option3} onChange={(e) => setOption3(e.target.value)} className="w-full p-2 border rounded text-sm"/>
               <input type="text" placeholder="Option 4" value={option4} onChange={(e) => setOption4(e.target.value)} className="w-full p-2 border rounded text-sm"/>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-gray-700">Correct Answer:</label>
              <select 
                value={correctOption}
                onChange={(e) => setCorrectOption(e.target.value)}
                className="p-1 border rounded bg-white"
              >
                <option value="0">Option 1</option>
                <option value="1">Option 2</option>
                <option value="2">Option 3</option>
                <option value="3">Option 4</option>
              </select>
              <button 
                onClick={addQuestionToDraft}
                className="ml-auto bg-blue-600 text-white text-sm px-4 py-1 rounded hover:bg-blue-700"
              >
                + Add Question
              </button>
            </div>
          </div>

          {/* List of Added Questions */}
          {quizQuestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-gray-400">Questions in this Lesson:</p>
              {quizQuestions.map((q, idx) => (
                <div key={idx} className="bg-white p-2 border rounded text-sm flex justify-between">
                  <span><strong>{idx + 1}.</strong> {q.question}</span>
                  <span className="text-green-600 font-bold">Ans: {q.options[q.correctAnswer]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handlePublish}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
        >
          {isSubmitting ? "Saving..." : "Save Lesson & Quiz"}
        </button>
      </div>

      {/* SECTION 2: MANAGE EXISTING (Same as before) */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📂 Manage Curriculum ({weeks.length})</h3>
        <div className="space-y-4">
          {weeks.map((week) => (
            <div key={week.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                   <span className="font-mono text-xs font-bold text-gray-400 uppercase">Week {week.order}</span>
                   {week.isPublished ? <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold">Published</span> : <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-bold">Locked</span>}
                </div>
                <h4 className="font-bold text-gray-800">{week.title}</h4>
                {/* Show if quiz exists */}
                {week.quiz && week.quiz.length > 0 && (
                   <span className="text-xs text-blue-600 font-medium">✨ Contains {week.quiz.length} Quiz Questions</span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => togglePublish(week.id, week.isPublished)} className={`px-4 py-2 text-sm font-bold rounded-lg border ${week.isPublished ? "border-orange-200 text-orange-600 hover:bg-orange-50" : "bg-green-600 text-white hover:bg-green-700"}`}>
                  {week.isPublished ? "🔒 Lock" : "🔓 Publish"}
                </button>
                <button onClick={() => handleDelete(week.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}