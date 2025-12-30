"use client";

import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "./ui/button";

export default function GoogleLoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      
      // Successful login! Redirect to dashboard.
      console.log("User Info:", result.user);
      router.push("/dashboard"); 

    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Check the console for details.");
    }
  };

  return (
    <Button
      onClick={handleLogin}
      size="lg"
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      Student Login (Google)
    </Button>
  );
}