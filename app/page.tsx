"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  GraduationCap,
  Shield,
  BookOpen,
  ArrowRight,
  Database,
  Cloud,
  CheckCircle,
  Video,
  Key,
  Users,
} from "lucide-react";

export default function HomePage() {
  const { profile, role } = useAuth();

  return (
    <div className="py-10 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20">
          <GraduationCap className="w-4 h-4" />
          <span>Next.js 15 · Supabase PostgreSQL RLS · Azure Blob Media</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Lightweight, High-Efficiency <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Learning Management System
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          SmartLMS pairs PostgreSQL Row-Level Security with direct Azure Blob Storage streaming to deliver an ultra-responsive, cost-effective LMS experience for Admins, Instructors, and Students.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {profile ? (
            <>
              {role === "admin" && (
                <Link
                  href="/dashboard/admin"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-all shadow-lg shadow-rose-500/25"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {role === "teacher" && (
                <Link
                  href="/dashboard/teacher"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/25"
                >
                  <BookOpen className="w-4 h-4" />
                  Teacher Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                href="/dashboard/student"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-500/25"
              >
                <GraduationCap className="w-4 h-4" />
                Student Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-lg shadow-blue-500/25"
              >
                Get Started / Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted text-card-foreground font-medium text-sm transition-all shadow-xs"
              >
                Demo Quick Personas
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 3 Core Roles Architecture */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-rose-500/40 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">1. Admin Dashboard</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Complete oversight across the platform: modify user roles (Admin/Teacher/Student), manage all courses, and assign course enrollments.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-border/50">
            <Link
              href="/dashboard/admin"
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
            >
              Open Admin View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-indigo-500/40 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">2. Teacher Dashboard</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Operational teaching workspace: full CRUD configurations for courses they create and direct student enrollment management.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-border/50">
            <Link
              href="/dashboard/teacher"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Open Teacher View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">3. Student Portal</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Focused, clean learning interface: enrolled courses grid and native HTML5 video player streaming Azure Blob storage media.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-border/50">
            <Link
              href="/dashboard/student"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              Open Student View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature & Tech Spec Matrix */}
      <section className="rounded-2xl border border-border/80 bg-muted/30 p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Technical Stack & Security Policies
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Key className="w-4 h-4 text-amber-500" /> PostgreSQL RLS
            </div>
            <p className="text-xs text-muted-foreground">
              Strict row-level security policies ensure students only access permitted enrollments, and teachers modify their own courses.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Cloud className="w-4 h-4 text-sky-500" /> Azure Blob Storage
            </div>
            <p className="text-xs text-muted-foreground">
              Zero LMS media egress markup: video streams load directly from Azure Blob Storage URLs in an HTML5 video player.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Local-First DX
            </div>
            <p className="text-xs text-muted-foreground">
              Runs seamlessly on localhost:3000 with real Supabase Auth or instant local fallback personas with full CRUD persistence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Users className="w-4 h-4 text-indigo-500" /> Role Guards
            </div>
            <p className="text-xs text-muted-foreground">
              Automatic route guarding redirects students out of admin endpoints immediately, keeping operational areas locked down.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
