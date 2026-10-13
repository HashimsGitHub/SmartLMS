"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RoleGuard } from "@/components/role-guard";
import { useAuth } from "@/lib/auth-context";
import { DataService } from "@/lib/data-service";
import { Course } from "@/lib/types";
import { VideoPlayer } from "@/components/video-player";
import {
  ArrowLeft,
  GraduationCap,
  Cloud,
  Calendar,
  Loader2,
  CheckCircle2,
  Sparkles,
  Share2,
} from "lucide-react";

function CourseViewerContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const { isMockMode } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) return;
      setLoading(true);
      try {
        const found = await DataService.getCourseById(courseId, isMockMode);
        setCourse(found);
      } catch (err) {
        console.error("Failed to load course module:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId, isMockMode]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <RoleGuard allowedRoles={["student", "teacher", "admin"]}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Enrolled Courses
          </Link>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted text-card-foreground transition-all cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Copied" : "Share Lesson"}</span>
          </button>
        </div>

        {loading ? (
          <div className="p-20 text-center text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-sm">Retrieving media stream and course data...</p>
          </div>
        ) : !course ? (
          <div className="p-16 text-center rounded-2xl border border-dashed border-border bg-card">
            <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h2 className="text-lg font-bold text-foreground">Course Not Found</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              This module may have been removed or you may not have active access credentials.
            </p>
            <Link
              href="/dashboard/student"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Return to Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Primary Video Player Component */}
            <div className="space-y-3">
              <VideoPlayer src={course.video_url} title={course.title} />

              {/* Streaming Endpoint Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Cloud className="w-4 h-4 text-sky-500" />
                  <span className="font-semibold text-foreground">Stream Source:</span>
                  <span className="font-mono text-[11px] truncate max-w-xs sm:max-w-md">
                    {course.video_url || "No URL bound"}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High Speed CDN
                </span>
              </div>
            </div>

            {/* Course Details Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Course Module
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    Published: {new Date(course.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {course.title}
                </h1>
              </div>

              {/* Instructor Info */}
              {course.creator_profile && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/50 border border-border/50">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    {course.creator_profile.full_name?.charAt(0) || "T"}
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Lead Instructor
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-foreground">
                      {course.creator_profile.full_name}
                    </span>
                  </div>
                </div>
              )}

              {/* Detailed Syllabus / Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  About this Lecture & Syllabus
                </h3>
                <div className="prose dark:prose-invert max-w-none text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {course.description || "No lecture syllabus description provided."}
                </div>
              </div>

              {/* Learning Objectives Checklist */}
              <div className="pt-4 border-t border-border/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Module Key Takeaways
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Direct browser playback with low latency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Azure Blob Media architecture integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>PostgreSQL Row Level Security protected access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Self-paced interactive learning</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

export default function CourseViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-sm">Loading course viewer...</p>
        </div>
      }
    >
      <CourseViewerContent />
    </Suspense>
  );
}
