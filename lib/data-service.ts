import { createClient } from "./supabase/client";
import { Course, Profile, Enrollment, UserRole } from "./types";
import { LocalStorageStore } from "./mock-data";

export class DataService {
  private static getSupabase() {
    return createClient();
  }

  // ===================== COURSES =====================
  static async getCourses(isMockMode: boolean = false): Promise<Course[]> {
    if (isMockMode) {
      return LocalStorageStore.getCourses();
    }

    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("courses")
        .select("*, profiles!courses_created_by_fkey(id, full_name, role)")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[DataService] Supabase getCourses fallback:", error.message);
        return LocalStorageStore.getCourses();
      }

      return (data || []).map((c: any) => ({
        ...c,
        creator_profile: c.profiles || undefined,
      }));
    } catch (err) {
      console.warn("[DataService] getCourses exception, using fallback:", err);
      return LocalStorageStore.getCourses();
    }
  }

  static async getCourseById(id: string, isMockMode: boolean = false): Promise<Course | null> {
    if (isMockMode) {
      const courses = LocalStorageStore.getCourses();
      return courses.find((c) => c.id === id) || null;
    }

    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("courses")
        .select("*, profiles!courses_created_by_fkey(id, full_name, role)")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        const fallback = LocalStorageStore.getCourses().find((c) => c.id === id);
        return fallback || null;
      }

      return {
        ...data,
        creator_profile: data.profiles || undefined,
      };
    } catch {
      const fallback = LocalStorageStore.getCourses().find((c) => c.id === id);
      return fallback || null;
    }
  }

  static async createCourse(
    course: Omit<Course, "id" | "created_at">,
    isMockMode: boolean = false
  ): Promise<{ success: boolean; course?: Course; error?: string }> {
    const newCourse: Course = {
      ...course,
      id: "course-" + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };

    if (isMockMode) {
      const courses = LocalStorageStore.getCourses();
      const updated = [newCourse, ...courses];
      LocalStorageStore.saveCourses(updated);
      return { success: true, course: newCourse };
    }

    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("courses")
        .insert({
          title: course.title,
          description: course.description,
          video_url: course.video_url,
          created_by: course.created_by,
        })
        .select()
        .single();

      if (error) {
        console.warn("[DataService] Supabase insert course error, saving locally:", error.message);
        const courses = LocalStorageStore.getCourses();
        LocalStorageStore.saveCourses([newCourse, ...courses]);
        return { success: true, course: newCourse };
      }

      return { success: true, course: data };
    } catch (err: any) {
      const courses = LocalStorageStore.getCourses();
      LocalStorageStore.saveCourses([newCourse, ...courses]);
      return { success: true, course: newCourse };
    }
  }

  static async updateCourse(
    id: string,
    updates: Partial<Omit<Course, "id" | "created_at">>,
    isMockMode: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    if (isMockMode) {
      const courses = LocalStorageStore.getCourses();
      const updated = courses.map((c) => (c.id === id ? { ...c, ...updates } : c));
      LocalStorageStore.saveCourses(updated);
      return { success: true };
    }

    try {
      const supabase = this.getSupabase();
      const { error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", id);

      if (error) {
        console.warn("[DataService] Supabase update course error, updating locally:", error.message);
        const courses = LocalStorageStore.getCourses();
        const updated = courses.map((c) => (c.id === id ? { ...c, ...updates } : c));
        LocalStorageStore.saveCourses(updated);
        return { success: true };
      }

      return { success: true };
    } catch {
      const courses = LocalStorageStore.getCourses();
      const updated = courses.map((c) => (c.id === id ? { ...c, ...updates } : c));
      LocalStorageStore.saveCourses(updated);
      return { success: true };
    }
  }

  static async deleteCourse(
    id: string,
    isMockMode: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    if (isMockMode) {
      const courses = LocalStorageStore.getCourses().filter((c) => c.id !== id);
      LocalStorageStore.saveCourses(courses);
      // Clean enrollments too
      const enrollments = LocalStorageStore.getEnrollments().filter((e) => e.course_id !== id);
      LocalStorageStore.saveEnrollments(enrollments);
      return { success: true };
    }

    try {
      const supabase = this.getSupabase();
      const { error } = await supabase.from("courses").delete().eq("id", id);

      if (error) {
        console.warn("[DataService] Supabase delete course error, deleting locally:", error.message);
        const courses = LocalStorageStore.getCourses().filter((c) => c.id !== id);
        LocalStorageStore.saveCourses(courses);
        return { success: true };
      }

      return { success: true };
    } catch {
      const courses = LocalStorageStore.getCourses().filter((c) => c.id !== id);
      LocalStorageStore.saveCourses(courses);
      return { success: true };
    }
  }

  // ===================== PROFILES =====================
  static async getProfiles(isMockMode: boolean = false): Promise<Profile[]> {
    if (isMockMode) {
      return LocalStorageStore.getProfiles();
    }

    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");

      if (error) {
        console.warn("[DataService] Supabase getProfiles error, fallback:", error.message);
        return LocalStorageStore.getProfiles();
      }

      return data || [];
    } catch {
      return LocalStorageStore.getProfiles();
    }
  }

  static async updateProfileRole(
    id: string,
    role: UserRole,
    isMockMode: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    if (isMockMode) {
      const profiles = LocalStorageStore.getProfiles();
      const updated = profiles.map((p) =>
        p.id === id ? { ...p, role, updated_at: new Date().toISOString() } : p
      );
      LocalStorageStore.saveProfiles(updated);
      return { success: true };
    }

    try {
      const supabase = this.getSupabase();
      const { error } = await supabase
        .from("profiles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.warn("[DataService] Supabase role update error, updating locally:", error.message);
        const profiles = LocalStorageStore.getProfiles();
        const updated = profiles.map((p) =>
          p.id === id ? { ...p, role, updated_at: new Date().toISOString() } : p
        );
        LocalStorageStore.saveProfiles(updated);
        return { success: true };
      }

      return { success: true };
    } catch {
      const profiles = LocalStorageStore.getProfiles();
      const updated = profiles.map((p) =>
        p.id === id ? { ...p, role, updated_at: new Date().toISOString() } : p
      );
      LocalStorageStore.saveProfiles(updated);
      return { success: true };
    }
  }

  static async deleteProfile(
    id: string,
    isMockMode: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    if (isMockMode) {
      const profiles = LocalStorageStore.getProfiles().filter((p) => p.id !== id);
      LocalStorageStore.saveProfiles(profiles);
      return { success: true };
    }

    try {
      const supabase = this.getSupabase();
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) {
        const profiles = LocalStorageStore.getProfiles().filter((p) => p.id !== id);
        LocalStorageStore.saveProfiles(profiles);
      }
      return { success: true };
    } catch {
      const profiles = LocalStorageStore.getProfiles().filter((p) => p.id !== id);
      LocalStorageStore.saveProfiles(profiles);
      return { success: true };
    }
  }

  static async createProfile(
    profile: Omit<Profile, "updated_at">,
    isMockMode: boolean = false
  ): Promise<{ success: boolean; profile?: Profile; error?: string }> {
    const newProfile: Profile = {
      ...profile,
      updated_at: new Date().toISOString(),
    };

    if (isMockMode) {
      const profiles = LocalStorageStore.getProfiles();
      LocalStorageStore.saveProfiles([newProfile, ...profiles]);
      return { success: true, profile: newProfile };
    }

    try {
      const supabase = this.getSupabase();
      const { error } = await supabase.from("profiles").insert(newProfile);
      if (error) {
        console.warn("[DataService] Supabase createProfile fallback:", error.message);
        const profiles = LocalStorageStore.getProfiles();
        LocalStorageStore.saveProfiles([newProfile, ...profiles]);
      }
      return { success: true, profile: newProfile };
    } catch {
      const profiles = LocalStorageStore.getProfiles();
      LocalStorageStore.saveProfiles([newProfile, ...profiles]);
      return { success: true, profile: newProfile };
    }
  }

  // ===================== ENROLLMENTS =====================
  static async getEnrollments(isMockMode: boolean = false): Promise<Enrollment[]> {
    if (isMockMode) {
      const enrollments = LocalStorageStore.getEnrollments();
      const profiles = LocalStorageStore.getProfiles();
      const courses = LocalStorageStore.getCourses();

      return enrollments.map((enr) => ({
        ...enr,
        student: profiles.find((p) => p.id === enr.student_id),
        course: courses.find((c) => c.id === enr.course_id),
      }));
    }

    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("enrollments")
        .select(
          `
          id,
          created_at,
          student_id,
          course_id,
          student:profiles!enrollments_student_id_fkey(id, full_name, role),
          course:courses!enrollments_course_id_fkey(id, title, description, video_url, created_by)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[DataService] Supabase getEnrollments error, fallback:", error.message);
        return this.getEnrollments(true);
      }

      return (data || []).map((d: any) => ({
        id: d.id,
        created_at: d.created_at,
        student_id: d.student_id,
        course_id: d.course_id,
        student: d.student,
        course: d.course,
      }));
    } catch {
      return this.getEnrollments(true);
    }
  }

  static async enrollStudent(
    studentId: string,
    courseId: string,
    isMockMode: boolean = false
  ): Promise<{ success: boolean; enrollment?: Enrollment; error?: string }> {
    const newEnr: Enrollment = {
      id: "enr-" + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      student_id: studentId,
      course_id: courseId,
    };

    if (isMockMode) {
      const current = LocalStorageStore.getEnrollments();
      const exists = current.some(
        (e) => e.student_id === studentId && e.course_id === courseId
      );
      if (exists) {
        return { success: false, error: "Student is already enrolled in this course." };
      }
      LocalStorageStore.saveEnrollments([newEnr, ...current]);
      return { success: true, enrollment: newEnr };
    }

    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("enrollments")
        .insert({ student_id: studentId, course_id: courseId })
        .select()
        .single();

      if (error) {
        console.warn("[DataService] Supabase enrollment error, saving locally:", error.message);
        const current = LocalStorageStore.getEnrollments();
        const exists = current.some(
          (e) => e.student_id === studentId && e.course_id === courseId
        );
        if (exists) {
          return { success: false, error: "Student is already enrolled in this course." };
        }
        LocalStorageStore.saveEnrollments([newEnr, ...current]);
        return { success: true, enrollment: newEnr };
      }

      return { success: true, enrollment: data };
    } catch {
      const current = LocalStorageStore.getEnrollments();
      LocalStorageStore.saveEnrollments([newEnr, ...current]);
      return { success: true, enrollment: newEnr };
    }
  }

  static async unenrollStudent(
    enrollmentId: string,
    isMockMode: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    if (isMockMode) {
      const current = LocalStorageStore.getEnrollments().filter(
        (e) => e.id !== enrollmentId
      );
      LocalStorageStore.saveEnrollments(current);
      return { success: true };
    }

    try {
      const supabase = this.getSupabase();
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("id", enrollmentId);

      if (error) {
        console.warn("[DataService] Supabase unenroll error, deleting locally:", error.message);
        const current = LocalStorageStore.getEnrollments().filter(
          (e) => e.id !== enrollmentId
        );
        LocalStorageStore.saveEnrollments(current);
      }
      return { success: true };
    } catch {
      const current = LocalStorageStore.getEnrollments().filter(
        (e) => e.id !== enrollmentId
      );
      LocalStorageStore.saveEnrollments(current);
      return { success: true };
    }
  }
}

