import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// 1. Verify if a Class Key exists
export async function verifyClassKey(classKey: string) {
  // Normalize key to uppercase to prevent "lion-99" errors
  const cleanKey = classKey.toUpperCase().trim();
  
  const q = query(
    collection(db, "classrooms"), 
    where("classKey", "==", cleanKey)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return { valid: false, error: "Invalid Class Key" };
  }

  const classData = snapshot.docs[0].data();
  
  if (classData.isLocked) {
    return { valid: false, error: "This class is locked by the teacher." };
  }

  return { 
    valid: true, 
    classId: snapshot.docs[0].id,
    schoolId: classData.schoolId,
    className: classData.name 
  };
}

// 2. Helper to generate "Shadow Email" (SIMPLIFIED)
export function generateShadowEmail(username: string, schoolId: string) {
  // Simple format: username@student.bubbleai.com
  // This means usernames must be unique across the WHOLE platform, which is easier for Login.
  const cleanUser = username.toLowerCase().replace(/\s/g, "");
  return `${cleanUser}@student.bubbleai.com`;
}