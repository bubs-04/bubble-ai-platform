"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizModalProps {
  questions: Question[];
  weekId: string;      // <--- NEW: To know which quiz
  studentId: string;   // <--- NEW: To know who took it
  onClose: () => void;
}

export default function QuizModal({ questions, weekId, studentId, onClose }: QuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentQ = questions[currentIndex];

  const handleOptionClick = (optionIndex: number) => {
    if (isAnswerChecked) return; 
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    // 1. Calculate new score (temp)
    let newScore = score;
    if (selectedOption === currentQ.correctAnswer) {
      newScore = score + 1;
      setScore(newScore);
    }

    // 2. Move to next OR Finish
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setShowResult(true);
      saveGrade(newScore); // <--- TRIGGER SAVE
    }
  };

  // --- THE NEW SAVE LOGIC ---
  const saveGrade = async (finalScore: number) => {
    setIsSaving(true);
    try {
      const percentage = Math.round((finalScore / questions.length) * 100);
      const gradeRef = doc(db, "users", studentId, "grades", weekId); // Sub-collection for grades

      // Save the attempt
      await setDoc(gradeRef, {
        score: finalScore,
        total: questions.length,
        percentage: percentage,
        passed: percentage >= 60, // 60% is passing
        completedAt: new Date()
      });
      console.log("Grade saved!");
    } catch (error) {
      console.error("Error saving grade:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const checkAnswer = () => {
    setIsAnswerChecked(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg">🧠 Knowledge Check</h2>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded">✕</button>
        </div>

        {/* BODY */}
        <div className="p-6">
          {!showResult ? (
            <>
              {/* PROGRESS BAR */}
              <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                ></div>
              </div>

              {/* QUESTION */}
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {currentIndex + 1}. {currentQ.question}
              </h3>

              {/* OPTIONS */}
              <div className="space-y-3 mb-6">
                {currentQ.options.map((option, idx) => {
                  let btnStyle = "border-gray-200 hover:bg-gray-50";
                  if (isAnswerChecked) {
                    if (idx === currentQ.correctAnswer) btnStyle = "bg-green-100 border-green-500 text-green-800";
                    else if (idx === selectedOption) btnStyle = "bg-red-100 border-red-500 text-red-800";
                    else btnStyle = "opacity-50";
                  } else if (selectedOption === idx) {
                    btnStyle = "border-blue-500 bg-blue-50 ring-1 ring-blue-500";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isAnswerChecked}
                      className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all ${btnStyle}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* ACTION BUTTON */}
              <button
                onClick={isAnswerChecked ? handleNext : checkAnswer}
                disabled={selectedOption === null}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                  selectedOption === null 
                    ? "bg-gray-300 cursor-not-allowed" 
                    : isAnswerChecked 
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isAnswerChecked 
                  ? (currentIndex + 1 < questions.length ? "Next Question" : "See Results") 
                  : "Check Answer"}
              </button>
            </>
          ) : (
            // RESULTS SCREEN
            <div className="text-center py-8">
              <div className="text-6xl mb-4">
                {score / questions.length > 0.7 ? "🎉" : "💪"}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h3>
              <p className="text-gray-600 mb-2">
                You scored <span className="font-bold text-blue-600 text-xl">{score} / {questions.length}</span>
              </p>
              
              {isSaving ? (
                <p className="text-sm text-gray-400 animate-pulse">Saving your grade...</p>
              ) : (
                <p className="text-sm text-green-600 font-bold">Grade Saved ✅</p>
              )}

              <div className="flex gap-3 justify-center mt-6">
                <button 
                  onClick={onClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}