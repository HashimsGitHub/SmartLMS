import { Profile, Course, Enrollment } from "./types";

export const INITIAL_MOCK_PROFILES: Profile[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Sarah Jenkins (System Admin)",
    role: "admin",
    updated_at: new Date().toISOString(),
    email: "admin@smartlms.edu",
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    full_name: "Dr. Robert Mitchell",
    role: "teacher",
    updated_at: new Date().toISOString(),
    email: "teacher@smartlms.edu",
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    full_name: "Alex Rivera",
    role: "student",
    updated_at: new Date().toISOString(),
    email: "student@smartlms.edu",
  },
  {
    id: "c0000000-0000-0000-0000-000000000004",
    full_name: "Maya Patel",
    role: "student",
    updated_at: new Date().toISOString(),
    email: "maya@smartlms.edu",
  },
];

export const INITIAL_MOCK_COURSES: Course[] = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    title: "SmartLMS Platform Overview & Training Walkthrough",
    description:
      "Comprehensive operational training walkthrough and feature demonstration for the SmartLMS learning platform. Direct video stream powered by your Azure Blob Storage container.",
    // Live Azure Blob Storage direct streaming link uploaded by user
    video_url: "https://smartlms.blob.core.windows.net/course-content/NUST-KSA%20Site%20Demo2.mp4",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    created_by: "b0000000-0000-0000-0000-000000000002",
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    title: "Cloud Infrastructure & Azure Blob Media Storage",
    description:
      "Master highly scalable cloud architectures, containerized microservices, and direct high-performance media delivery from Azure Blob Storage containers.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    created_by: "b0000000-0000-0000-0000-000000000002",
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    title: "Next.js 15 App Router & PostgreSQL Mastery",
    description:
      "Deep dive into React Server Components, Next.js Server Actions, Row Level Security (RLS) policies in PostgreSQL, and responsive Tailwind interfaces.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    created_by: "a0000000-0000-0000-0000-000000000001",
  },
];

export const INITIAL_MOCK_ENROLLMENTS: Enrollment[] = [
  {
    id: "e0000000-0000-0000-0000-000000000001",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    student_id: "c0000000-0000-0000-0000-000000000003",
    course_id: "d0000000-0000-0000-0000-000000000001",
  },
  {
    id: "e0000000-0000-0000-0000-000000000002",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    student_id: "c0000000-0000-0000-0000-000000000003",
    course_id: "d0000000-0000-0000-0000-000000000002",
  },
  {
    id: "e0000000-0000-0000-0000-000000000003",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    student_id: "c0000000-0000-0000-0000-000000000004",
    course_id: "d0000000-0000-0000-0000-000000000001",
  },
];

const STORAGE_KEYS = {
  PROFILES: "smartlms_mock_profiles_v2",
  COURSES: "smartlms_mock_courses_v2",
  ENROLLMENTS: "smartlms_mock_enrollments_v2",
  ACTIVE_USER: "smartlms_mock_active_user_v2",
};

export class LocalStorageStore {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  static getProfiles(): Profile[] {
    if (!this.isBrowser()) return INITIAL_MOCK_PROFILES;
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_MOCK_PROFILES));
      return INITIAL_MOCK_PROFILES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_PROFILES;
    }
  }

  static saveProfiles(profiles: Profile[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }

  static getCourses(): Course[] {
    if (!this.isBrowser()) return INITIAL_MOCK_COURSES;
    const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_MOCK_COURSES));
      return INITIAL_MOCK_COURSES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_COURSES;
    }
  }

  static saveCourses(courses: Course[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }

  static getEnrollments(): Enrollment[] {
    if (!this.isBrowser()) return INITIAL_MOCK_ENROLLMENTS;
    const stored = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(INITIAL_MOCK_ENROLLMENTS));
      return INITIAL_MOCK_ENROLLMENTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_ENROLLMENTS;
    }
  }

  static saveEnrollments(enrollments: Enrollment[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
  }

  static getActiveUser(): Profile | null {
    if (!this.isBrowser()) return null;
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  static setActiveUser(profile: Profile | null): void {
    if (!this.isBrowser()) return;
    if (profile) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    }
  }

  static resetToDefaults(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_MOCK_PROFILES));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_MOCK_COURSES));
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(INITIAL_MOCK_ENROLLMENTS));
  }
}
