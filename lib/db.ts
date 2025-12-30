import { db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";

export async function checkOrCreateUser(user: User) {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // This is a NEW user.
    // Logic: If this is the VERY first user (you), make them an Admin. 
    // Everyone else will be a "Student" by default until changed.
    
    const newUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: "student", // Default role
      createdAt: serverTimestamp(),
      schoolId: null, // No school yet
    };

    // Save to Firestore
    try {
      await setDoc(userRef, newUser);
      console.log("New user profile created!");
      return newUser;
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  } else {
    // Existing user - return their data
    console.log("Found existing user profile.");
    return userSnap.data();
  }
}
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

// Helper: Generate a random 6-character code (e.g., "AB3-9X")
function generateClassCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No 'I', '1', 'O', '0' to avoid confusion
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.slice(0, 3) + "-" + result.slice(3);
}

// 1. Create a Classroom
export async function createClassroom(teacherId: string, schoolId: string, name: string, grade: number) {
  // Try to find a unique code (simple retry logic)
  let classKey = generateClassCode();
  let isUnique = false;
  
  // Safety check: ensure code doesn't exist
  while (!isUnique) {
    const q = query(collection(db, "classrooms"), where("classKey", "==", classKey));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      isUnique = true;
    } else {
      classKey = generateClassCode(); // Try again
    }
  }

  const newClass = {
    teacherId,
    schoolId: schoolId || "demo_school", // Fallback for now
    name,
    grade: Number(grade),
    classKey,
    studentIds: [],
    isLocked: false,
    createdAt: new Date(),
  };

  const docRef = await addDoc(collection(db, "classrooms"), newClass);
  return { id: docRef.id, ...newClass };
}

// 2. Get Classes for a Teacher
export async function getTeacherClasses(teacherId: string) {
  const q = query(collection(db, "classrooms"), where("teacherId", "==", teacherId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}