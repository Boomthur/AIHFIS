export type UserRole = "STUDENT" | "TEACHER";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface LessonWithTeacher {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  isPublished: boolean;
  createdAt: Date;
  teacherId: string;
  courseId: string | null;
  teacher: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface CourseWithDetails {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  createdAt: Date;
  lessons: { id: string; title: string }[];
  enrollments: { id: string }[];
  _count?: {
    lessons: number;
    enrollments: number;
  };
}

export interface CommentWithUser {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  lessonId: string;
  parentId: string | null;
  user: {
    id: string;
    name: string;
    role: string;
    avatarUrl: string | null;
  };
  replies: CommentWithUser[];
}
