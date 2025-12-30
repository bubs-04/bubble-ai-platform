export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "student" | "teacher" | "admin";
  schoolId: string;
}

export interface Week {
  id: string;
  order: number;
  title: string;
  content: string;
  videoUrl?: string;
  isPublished: boolean;
  quiz?: Array<{
    question: string;
    options: string[];
    answer: string;
  }>;
}