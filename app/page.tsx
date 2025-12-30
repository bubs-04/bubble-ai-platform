"use client";

import { useState } from "react";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // <--- Toggle between Login and Signup
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle Email/Password
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // --- CREATE NEW ACCOUNT ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Set a default display name based on email (e.g. "student1")
        const name = email.split("@")[0];
        await updateProfile(user, { displayName: name });

        // Create the user document immediately
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          role: "student", // Default to student
          createdAt: new Date(),
          schoolId: null, // No school yet
          classIds: []    // No class yet
        });

      } else {
        // --- LOGIN EXISTING ACCOUNT ---
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') setError("No user found with that email.");
      else if (err.code === 'auth/wrong-password') setError("Incorrect password.");
      else if (err.code === 'auth/email-already-in-use') setError("That email is already registered.");
      else setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row max-w-4xl w-full overflow-hidden">
        
        {/* LEFT SIDE: BRANDING */}
        <div className="w-full md:w-1/2 p-12 bg-blue-50 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg">
            🧠
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bubble AI</h1>
          <p className="text-gray-600 mb-8">The AI-Powered Learning Platform for Future Billionaires.</p>
          <div className="text-sm text-gray-400">
            <p>🏫 Multi-Tenant Architecture</p>
            <p>🤖 AI Tutor Integration</p>
            <p>🔒 Enterprise Security</p>
          </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {isSignUp ? "Create Student Account" : "Welcome Back"}
          </h2>

          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all mb-4"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with email</span></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-blue-600 font-bold hover:underline"
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}