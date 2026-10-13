"use client";

import React, { useState, useEffect } from "react";
import { RoleGuard } from "@/components/role-guard";
import { useAuth } from "@/lib/auth-context";
import { DataService } from "@/lib/data-service";
import { Course, Profile, Enrollment } from "@/lib/types";
import {
  BookOpen,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  X,
  Loader2,
  Cloud,
  AlertCircle,
  Video,
  UserPlus,
} from "lucide-react";
import { VideoUpload } from "@/components/video-upload";

export default function TeacherDashboardPage() {
  const { profile, isMockMode } = useAuth();

  const [activeTab, setActiveTab] = useState<"courses" | "enrollments">("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [courseSearch, setCourseSearch] = useState("");
  const [enrollmentSearch, setEnrollmentSearch] = useState("");

  // Course Form Modal state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseVideoUrl, setCourseVideoUrl] = useState("");

  // Quick Enrollment Form state
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [allCourses, allProfiles, allEnrollments] = await Promise.all([
        DataService.getCourses(isMockMode),
        DataService.getProfiles(isMockMode),
        DataService.getEnrollments(isMockMode),
      ]);

      // Restrict courses to those created by this teacher
      // If admin is viewing, or if teacher created courses, filter by creator
      const teacherCourses = allCourses.filter(
        (c) => !c.created_by || c.created_by === profile?.id || profile?.role === "admin"
      );

      setCourses(teacherCourses);
      setStudents(allProfiles.filter((p) => p.role === "student"));

      // Filter enrollments for courses managed by this teacher
      const teacherCourseIds = new Set(teacherCourses.map((c) => c.id));
      const teacherEnrollments = allEnrollments.filter((e) => teacherCourseIds.has(e.course_id));
      setEnrollments(teacherEnrollments);
    } catch (err) {
      console.error("Failed to load teacher dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile, isMockMode]);

  const showNotify = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // ================= COURSE OPERATIONS =================
  const handleOpenCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourseId(course.id);
      setCourseTitle(course.title);
      setCourseDesc(course.description || "");
      setCourseVideoUrl(course.video_url || "");
    } else {
      setEditingCourseId(null);
      setCourseTitle("");
      setCourseDesc("");
      setCourseVideoUrl("");
    }
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      showNotify("error", "Course title is required.");
      return;
    }

    setActionLoading(true);
    try {
      if (editingCourseId) {
        const res = await DataService.updateCourse(
          editingCourseId,
          {
            title: courseTitle,
            description: courseDesc,
            video_url: courseVideoUrl,
          },
          isMockMode
        );
        if (res.success) {
          showNotify("success", "Course updated successfully!");
          setCourseModalOpen(false);
          await loadData();
        } else {
          showNotify("error", res.error || "Failed to update course.");
        }
      } else {
        const res = await DataService.createCourse(
          {
            title: courseTitle,
            description: courseDesc,
            video_url: courseVideoUrl,
            created_by: profile?.id || null,
          },
          isMockMode
        );
        if (res.success) {
          showNotify("success", "Course created successfully!");
          setCourseModalOpen(false);
          await loadData();
        } else {
          showNotify("error", res.error || "Failed to create course.");
        }
      }
    } catch {
      showNotify("error", "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete your course "${title}"?`)) return;
    setActionLoading(true);
    try {
      const res = await DataService.deleteCourse(id, isMockMode);
      if (res.success) {
        showNotify("success", `Course "${title}" deleted.`);
        await loadData();
      } else {
        showNotify("error", res.error || "Failed to delete course.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // ================= ENROLLMENT OPERATIONS =================
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId) {
      showNotify("error", "Please select both a student and a course.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await DataService.enrollStudent(selectedStudentId, selectedCourseId, isMockMode);
      if (res.success) {
        showNotify("success", "Student enrolled in course!");
        setSelectedStudentId("");
        setSelectedCourseId("");
        await loadData();
      } else {
        showNotify("error", res.error || "Failed to enroll student.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawStudent = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to withdraw this student?")) return;
    setActionLoading(true);
    try {
      const res = await DataService.unenrollStudent(enrollmentId, isMockMode);
      if (res.success) {
        showNotify("success", "Student withdrawn from course.");
        await loadData();
      } else {
        showNotify("error", res.error || "Failed to withdraw student.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.description?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter((e) => {
    const sName = e.student?.full_name?.toLowerCase() || "";
    const cTitle = e.course?.title?.toLowerCase() || "";
    const q = enrollmentSearch.toLowerCase();
    return sName.includes(q) || cTitle.includes(q);
  });

  return (
    <RoleGuard allowedRoles={["admin", "teacher"]}>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Teacher Operations Portal
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Operational dashboard: Author your courses, manage Azure video links, and enroll students.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md bg-muted border border-border text-muted-foreground font-mono">
              My Courses: {courses.length} · Enrolled Students: {enrollments.length}
            </span>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-between border ${
              notification.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="hover:opacity-75 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-border overflow-x-auto whitespace-nowrap [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex shrink-0 items-center gap-2 px-4 sm:px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "courses"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            My Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("enrollments")}
            className={`flex shrink-0 items-center gap-2 px-4 sm:px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "enrollments"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Enrollment Roster ({enrollments.length})
          </button>
        </div>

        {/* TAB 1: MY COURSES */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search my courses..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={() => handleOpenCourseModal()}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Create New Course
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                <p className="text-xs mt-2">Loading course curriculum...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
                <BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-semibold text-foreground text-sm">No Courses Authored Yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Author your first course lesson with an Azure Blob video stream link.
                </p>
                <button
                  onClick={() => handleOpenCourseModal()}
                  className="mt-4 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium cursor-pointer"
                >
                  Create Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-indigo-500/30 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base text-foreground line-clamp-1">{c.title}</h3>
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          <Cloud className="w-3 h-3" /> Azure Media
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {c.description || "No description provided."}
                      </p>
                      {c.video_url && (
                        <div className="p-2 rounded-lg bg-muted/60 text-[11px] font-mono text-muted-foreground truncate flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{c.video_url}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenCourseModal(c)}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Edit Course"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id, c.title)}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ENROLLMENT ROSTER */}
        {activeTab === "enrollments" && (
          <div className="space-y-6">
            {/* Quick Student Enrollment Form */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs">
              <h3 className="font-bold text-sm text-foreground mb-1 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-500" />
                Enroll Student into Course
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Add students into your available courses to grant them streaming access.
              </p>

              <form onSubmit={handleEnrollStudent} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Student
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.email || s.id.substring(0, 8)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Your Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={actionLoading || !selectedStudentId || !selectedCourseId}
                    className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Enroll Student
                  </button>
                </div>
              </form>
            </div>

            {/* Enrollment List */}
            <div className="space-y-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter student or course..."
                  value={enrollmentSearch}
                  onChange={(e) => setEnrollmentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[11px] font-semibold">
                      <tr>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Course Module</th>
                        <th className="px-4 py-3">Date Enrolled</th>
                        <th className="px-4 py-3 text-right">Withdraw</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredEnrollments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-muted-foreground">
                            No students enrolled in your courses yet.
                          </td>
                        </tr>
                      ) : (
                        filteredEnrollments.map((enr) => (
                          <tr key={enr.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-semibold text-foreground">
                              {enr.student?.full_name || enr.student_id}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {enr.course?.title || enr.course_id}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-muted-foreground">
                              {new Date(enr.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleWithdrawStudent(enr.id)}
                                disabled={actionLoading}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Withdraw Student"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREATE / EDIT COURSE */}
        {courseModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-4 sm:p-6 space-y-4 max-h-[90dvh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">
                  {editingCourseId ? "Edit Course" : "Create New Course"}
                </h3>
                <button
                  onClick={() => setCourseModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Course Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mastering React 19 and Next.js 15"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Course objectives and lecture description..."
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <VideoUpload
                  value={courseVideoUrl}
                  onChange={setCourseVideoUrl}
                  disabled={actionLoading}
                />

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setCourseModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm border border-border text-muted-foreground hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingCourseId ? "Update Course" : "Save Course"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

