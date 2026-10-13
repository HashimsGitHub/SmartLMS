"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/role-guard";
import { useAuth } from "@/lib/auth-context";
import { DataService } from "@/lib/data-service";
import { Course, Enrollment } from "@/lib/types";
import {
  GraduationCap,
  PlayCircle,
  BookOpen,
  Cloud,
  Loader2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
} from "lucide-react";

export default function StudentPortalPage() {
  const { profile, isMockMode } = useAuth();

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [courses, enrollments] = await Promise.all([
        DataService.getCourses(isMockMode),
        DataService.getEnrollments(isMockMode),
      ]);

      setAllCourses(courses);

      // Filter courses the logged-in student is enrolled in
      const studentEnrollments = enrollments.filter(
        (e) => e.student_id === profile?.id
      );
      const enrolledCourseIds = new Set(studentEnrollments.map((e) => e.course_id));

      const myCourses = courses.filter((c) => enrolledCourseIds.has(c.id));
      setEnrolledCourses(myCourses);
    } catch (err) {
      console.error("Failed to load student courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile, isMockMode]);

  const handleSelfEnroll = async (courseId: string) => {
    if (!profile) return;
    setEnrollingId(courseId);
    try {
      const res = await DataService.enrollStudent(profile.id, courseId, isMockMode);
      if (res.success) {
        await loadData();
      }
    } finally {
      setEnrollingId(null);
    }
  };

  // Courses the student is not yet enrolled in
  const availableToEnroll = allCourses.filter(
    (c) => !enrolledCourses.some((ec) => ec.id === c.id)
  );

  return (
    <RoleGuard allowedRoles={["student", "teacher", "admin"]}>
      <div className="space-y-10">
        {/* Header Greeting */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-emerald-600/10 border border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <GraduationCap className="w-3.5 h-3.5" /> Student Learning Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {profile?.full_name?.split(" ")[0] || "Learner"}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Continue your courses and stream high-definition lessons directly from Azure Blob Storage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-card border border-border text-center shadow-xs">
              <span className="block text-xl font-bold text-foreground">
                {enrolledCourses.length}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Enrolled Courses
              </span>
            </div>
          </div>
        </div>

        {/* Section: My Enrolled Courses */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              My Enrolled Courses ({enrolledCourses.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-16 text-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-xs mt-2">Loading your enrolled courses...</p>
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
              <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/60" />
              <h3 className="text-base font-semibold text-foreground">No Active Enrollments</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                You are currently not enrolled in any course modules. Explore the catalog below to enroll and start watching right away.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="group flex flex-col justify-between rounded-2xl bg-card border border-border/80 shadow-xs hover:shadow-lg hover:border-blue-500/40 transition-all overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Cloud className="w-3 h-3" /> Azure Video
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-bold text-base text-foreground group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {course.description || "Comprehensive syllabus module ready for streaming."}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      href={`/dashboard/student/course/${course.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 group-hover:scale-[1.02]"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Watch Lesson & Media</span>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section: Available Courses Catalog */}
        {availableToEnroll.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-border/60">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                Explore Available Courses
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Join additional modules authored by teachers to expand your skills.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableToEnroll.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col justify-between rounded-2xl bg-card border border-border/70 p-6 space-y-4"
                >
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      Ready to Stream
                    </span>
                    <h3 className="font-bold text-base text-foreground line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {course.description || "Ready for instant enrollment."}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelfEnroll(course.id)}
                    disabled={enrollingId === course.id}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {enrollingId === course.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Enroll & Add to My Courses</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </RoleGuard>
  );
}

