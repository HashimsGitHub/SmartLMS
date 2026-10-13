"use client";

import React, { useState, useEffect } from "react";
import { RoleGuard } from "@/components/role-guard";
import { useAuth } from "@/lib/auth-context";
import { DataService } from "@/lib/data-service";
import { Course, Profile, Enrollment, UserRole } from "@/lib/types";
import {
  Shield,
  BookOpen,
  Users,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Search,
  Check,
  X,
  Loader2,
  Cloud,
  UserCheck,
  AlertCircle,
  Video,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { profile, isMockMode } = useAuth();

  const [activeTab, setActiveTab] = useState<"courses" | "users" | "enrollments">("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search queries
  const [courseSearch, setCourseSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [enrollmentSearch, setEnrollmentSearch] = useState("");

  // Course Form Modal state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseVideoUrl, setCourseVideoUrl] = useState("");

  // User Form Modal state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("student");

  // Enrollment Assignment Form state
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedCourses, fetchedProfiles, fetchedEnrollments] = await Promise.all([
        DataService.getCourses(isMockMode),
        DataService.getProfiles(isMockMode),
        DataService.getEnrollments(isMockMode),
      ]);
      setCourses(fetchedCourses);
      setProfiles(fetchedProfiles);
      setEnrollments(fetchedEnrollments);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isMockMode]);

  const showNotify = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // ================= COURSE HANDLERS =================
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
      setCourseVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
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
        // Update existing course
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
        // Create new course
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
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
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

  // ================= USER HANDLERS =================
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setActionLoading(true);
    try {
      const res = await DataService.updateProfileRole(userId, newRole, isMockMode);
      if (res.success) {
        showNotify("success", `User role updated to ${newRole.toUpperCase()}.`);
        await loadData();
      } else {
        showNotify("error", res.error || "Failed to update role.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove user "${name}"?`)) return;
    setActionLoading(true);
    try {
      const res = await DataService.deleteProfile(id, isMockMode);
      if (res.success) {
        showNotify("success", `User "${name}" removed.`);
        await loadData();
      } else {
        showNotify("error", res.error || "Failed to delete user.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) {
      showNotify("error", "Full name is required.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await DataService.createProfile(
        {
          id: "usr-" + Math.random().toString(36).substring(2, 8),
          full_name: newUserName.trim(),
          role: newUserRole,
          email: newUserEmail.trim() || undefined,
        },
        isMockMode
      );
      if (res.success) {
        showNotify("success", `User profile for "${newUserName}" created.`);
        setUserModalOpen(false);
        setNewUserName("");
        setNewUserEmail("");
        await loadData();
      } else {
        showNotify("error", res.error || "Failed to create user.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // ================= ENROLLMENT HANDLERS =================
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
        showNotify("success", "Student successfully mapped and enrolled in course!");
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

  const handleUnenroll = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to withdraw this enrollment?")) return;
    setActionLoading(true);
    try {
      const res = await DataService.unenrollStudent(enrollmentId, isMockMode);
      if (res.success) {
        showNotify("success", "Enrollment removed.");
        await loadData();
      } else {
        showNotify("error", res.error || "Failed to unenroll.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Filter lists
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.description?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredProfiles = profiles.filter((p) =>
    p.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
    p.role.toLowerCase().includes(userSearch.toLowerCase()) ||
    p.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter((e) => {
    const studentName = e.student?.full_name?.toLowerCase() || "";
    const courseTitle = e.course?.title?.toLowerCase() || "";
    const query = enrollmentSearch.toLowerCase();
    return studentName.includes(query) || courseTitle.includes(query);
  });

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Shield className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Admin Control Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Full CRUD management for Courses, User Roles, and Student Enrollments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md bg-muted border border-border text-muted-foreground font-mono">
              Total Courses: {courses.length} · Users: {profiles.length}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "courses"
                ? "border-rose-600 text-rose-600 dark:text-rose-400"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Manage Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "users"
                ? "border-rose-600 text-rose-600 dark:text-rose-400"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Users className="w-4 h-4" />
            Manage Users ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab("enrollments")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "enrollments"
                ? "border-rose-600 text-rose-600 dark:text-rose-400"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Manage Enrollments ({enrollments.length})
          </button>
        </div>

        {/* TAB 1: MANAGE COURSES */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search courses by title..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <button
                onClick={() => handleOpenCourseModal()}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-medium transition-all shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add New Course
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-rose-500" />
                <p className="text-xs mt-2">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
                <BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-semibold text-foreground text-sm">No Courses Found</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Get started by adding a course module with an Azure Blob streaming link.
                </p>
                <button
                  onClick={() => handleOpenCourseModal()}
                  className="mt-4 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium cursor-pointer"
                >
                  Create First Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-rose-500/30 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base text-foreground line-clamp-1">{c.title}</h3>
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          <Cloud className="w-3 h-3" /> Azure
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {c.description || "No description provided."}
                      </p>
                      {c.video_url && (
                        <div className="p-2 rounded-lg bg-muted/60 text-[11px] font-mono text-muted-foreground truncate flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
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

        {/* TAB 2: MANAGE USERS */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search user by name, role or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <button
                onClick={() => setUserModalOpen(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-medium transition-all shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add User Profile
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[11px] font-semibold">
                    <tr>
                      <th className="px-4 py-3">Full Name & Email</th>
                      <th className="px-4 py-3">User ID</th>
                      <th className="px-4 py-3">Current Role</th>
                      <th className="px-4 py-3">Change Role Trigger</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredProfiles.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{p.full_name}</div>
                          <div className="text-[11px] text-muted-foreground">{p.email || "No email"}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground truncate max-w-[120px]">
                          {p.id}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              p.role === "admin"
                                ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                : p.role === "teacher"
                                ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            }`}
                          >
                            {p.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {/* Dropdown trigger to modify user role */}
                          <select
                            value={p.role}
                            onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole)}
                            disabled={actionLoading}
                            className="text-xs rounded-lg border border-input bg-background text-foreground px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer disabled:opacity-50"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(p.id, p.full_name)}
                            disabled={actionLoading}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Remove User Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE ENROLLMENTS */}
        {activeTab === "enrollments" && (
          <div className="space-y-6">
            {/* Assignment Interface */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs">
              <h3 className="font-bold text-sm text-foreground mb-1 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-rose-500" />
                Assign Student to Course
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Map any registered student to an active course module.
              </p>

              <form onSubmit={handleEnrollStudent} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Select Student
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">-- Choose Student --</option>
                    {profiles
                      .filter((p) => p.role === "student")
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.email || p.id.substring(0, 8)})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Select Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
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
                    className="w-full py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Confirm Assignment
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Enrollments Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Filter enrollments..."
                    value={enrollmentSearch}
                    onChange={(e) => setEnrollmentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[11px] font-semibold">
                      <tr>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Enrolled Course</th>
                        <th className="px-4 py-3">Enrollment Date</th>
                        <th className="px-4 py-3 text-right">Withdraw</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredEnrollments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-muted-foreground">
                            No enrollments found. Assign a student above!
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
                                onClick={() => handleUnenroll(enr.id)}
                                disabled={actionLoading}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Withdraw Enrollment"
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

        {/* MODAL: ADD / EDIT COURSE */}
        {courseModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">
                  {editingCourseId ? "Edit Course Module" : "Create New Course Module"}
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
                    placeholder="e.g. Distributed Cloud Computing with Azure"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide syllabus outline and learning goals..."
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Azure Video URL (Streaming Link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://mystorageaccount.blob.core.windows.net/videos/lesson1.mp4"
                    value={courseVideoUrl}
                    onChange={(e) => setCourseVideoUrl(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Stored as text in PostgreSQL courses table. Streamed directly via HTML5 video player.
                  </p>
                </div>

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
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingCourseId ? "Update Course" : "Create Course"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD USER PROFILE */}
        {userModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">Add User Profile</h3>
                <button
                  onClick={() => setUserModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Smith"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Email</label>
                  <input
                    type="email"
                    placeholder="jordan.smith@smartlms.edu"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm border border-border text-muted-foreground hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Save Profile</span>
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

