export type UserRole = "admin" | "teacher" | "student";

export interface Profile {
  id: string;
  updated_at: string;
  full_name: string;
  role: UserRole;
  email?: string;
}

export interface Course {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  video_url: string | null; // Azure Blob Storage streaming link
  created_by: string | null; // Profile ID
  creator_profile?: Profile;
}

export interface Enrollment {
  id: string;
  created_at: string;
  student_id: string;
  course_id: string;
  student?: Profile;
  course?: Course;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "updated_at"> & { updated_at?: string };
        Update: Partial<Profile>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Course>;
      };
      enrollments: {
        Row: Enrollment;
        Insert: Omit<Enrollment, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Enrollment>;
      };
    };
  };
}

