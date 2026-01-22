// THE HIERARCHY OF BUBBLE AI

export type UserRole = "master" | "hq" | "teacher" | "student";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  schoolId?: string; // Links HQ/Teacher/Student to a specific client
  classIds?: string[]; // Which classes are they in?
  approved: boolean; // For students waiting for teacher approval
}

export interface School {
  id: string;
  name: string;
  brandingColor: string; // e.g., "#FF5733"
  subscriptionActive: boolean;
  assignedHqId: string;
}

export interface Classroom {
  id: string;
  name: string; // e.g., "6A"
  schoolId: string;
  teacherId: string;
  classCode: string; // The secret code for students
}

export interface Lesson {
  id: string;
  weekOrder: number;
  title: string;
  description: string;
  videoUrl?: string; // YouTube Embed
  type: "lecture" | "lab" | "quiz";
  isPublished: boolean; // Teacher controls this
  aiTool?: "text-gen" | "image-gen"; // For AI Labs
}

export interface Submission {
  id: string;
  studentId: string;
  lessonId: string;
  content: string; // Text answer or Image URL
  grade?: number;
  feedback?: string;
}