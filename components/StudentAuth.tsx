"use client";

import { useState } from "react";
import { verifyClassKey } from "@/lib/actions";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function StudentAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form Data
  const [classKey, setClassKey] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // --- THE FIX: CONSISTENT EMAIL GENERATOR ---
  // We define this HERE to make sure it is 100% consistent between Join and Login.
  const getStudentEmail = (username: string) => {
    const cleanUser = username.toLowerCase().replace(/\s/g, "");
    return `${cleanUser}@student.bubbleai.com`;
  };
  // -------------------------------------------

  // LOGIN LOGIC
  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await setPersistence(auth, browserLocalPersistence);

      // Use the local helper function
      const shadowEmail = getStudentEmail(username);
      console.log("Logging in as:", shadowEmail); // Debugging

      await signInWithEmailAndPassword(auth, shadowEmail, password);
      
      // Wait 1s for cookie to save
      setTimeout(() => {
         window.location.href = "/dashboard";
      }, 1000);
      
    } catch (err: any) {
      console.error("Login Error:", err);
      alert("Login Failed: " + err.message);
      setLoading(false);
    }
  };

  // JOIN LOGIC
  const handleJoin = async () => {
    if (!classKey || !fullName || !username || !password) {
      alert("Please fill in all fields.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await setPersistence(auth, browserLocalPersistence);

      const classCheck = await verifyClassKey(classKey);
      if (!classCheck.valid) {
        throw new Error(classCheck.error);
      }

      // Use the EXACT SAME local helper function
      const shadowEmail = getStudentEmail(username);
      console.log("Creating Account:", shadowEmail); // Debugging

      const userCredential = await createUserWithEmailAndPassword(auth, shadowEmail, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: fullName,
        username: username,
        role: "student",
        schoolId: classCheck.schoolId,
        enrolledClassIds: [classCheck.classId],
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Wait 1s for cookie to save
      setTimeout(() => {
         window.location.href = "/dashboard";
      }, 1000);

    } catch (err: any) {
      console.error("Join Error:", err);
      if (err.code === "auth/email-already-in-use") {
        alert("That username is taken. Try logging in!");
      } else {
        alert("Join Failed: " + err.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border">
      <div className="flex gap-4 mb-6 border-b">
        <button 
          type="button"
          className={`pb-2 font-bold flex-1 ${isLogin ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400"}`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button 
          type="button"
          className={`pb-2 font-bold flex-1 ${!isLogin ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400"}`}
          onClick={() => setIsLogin(false)}
        >
          Join a Class
        </button>
      </div>

      {isLogin ? (
        <div className="space-y-4">
           <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
              <input 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="rahul123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input 
                type="password"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button 
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Class Code</label>
            <input 
              className="w-full p-2 border rounded uppercase tracking-widest font-mono"
              placeholder="e.g. 79S-WUK"
              value={classKey}
              onChange={(e) => setClassKey(e.target.value.toUpperCase())}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your Full Name</label>
            <input 
              className="w-full p-2 border rounded"
              placeholder="e.g. Rahul Verma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
              <input 
                className="w-full p-2 border rounded"
                placeholder="rahul123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input 
                type="password"
                className="w-full p-2 border rounded"
                placeholder="*****"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="button"
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            {loading ? "Creating Account..." : "Join Class"}
          </button>
        </div>
      )}
    </div>
  );
}