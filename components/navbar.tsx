"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import {
  GraduationCap,
  Shield,
  BookOpen,
  UserCheck,
  LogOut,
  ExternalLink,
  ChevronDown,
  Layers,
  Database,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const { user, profile, role, signOut, isMockMode, loginAsDemoUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleSwitchDemoRole = async (targetRole: UserRole) => {
    await loginAsDemoUser(targetRole);
    setSwitcherOpen(false);
    if (targetRole === "admin") router.push("/dashboard/admin");
    else if (targetRole === "teacher") router.push("/dashboard/teacher");
    else router.push("/dashboard/student");
  };

  const getRoleBadge = (r: UserRole | null) => {
    switch (r) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case "teacher":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-3 h-3" /> Teacher
          </span>
        );
      case "student":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20">
            <GraduationCap className="w-3 h-3" /> Student
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group transition-all">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-foreground flex items-center gap-1.5">
                Smart<span className="text-blue-600 dark:text-blue-400">LMS</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                Azure Media & Supabase
              </span>
            </div>
          </Link>

          {/* Navigation links based on role */}
          {profile && (
            <nav className="hidden md:flex items-center gap-1">
              {role === "admin" && (
                <Link
                  href="/dashboard/admin"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith("/dashboard/admin")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Admin Portal
                </Link>
              )}
              {(role === "admin" || role === "teacher") && (
                <Link
                  href="/dashboard/teacher"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith("/dashboard/teacher")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Teacher Portal
                </Link>
              )}
              <Link
                href="/dashboard/student"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/dashboard/student")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Student Portal
              </Link>
            </nav>
          )}
        </div>

        {/* Right Section: Mode Indicator, Quick Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Mock Mode / Supabase badge */}
          {isMockMode ? (
            <div
              title="Running in local fallback mock mode. Data persists in browser localStorage."
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            >
              <Sparkles className="w-3 h-3" />
              <span>Local Mock</span>
            </div>
          ) : (
            <div
              title="Connected to Supabase PostgreSQL"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            >
              <Database className="w-3 h-3" />
              <span>Supabase DB</span>
            </div>
          )}

          {/* Quick Role Switcher for Developer DX */}
          <div className="relative">
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-card text-card-foreground hover:bg-accent transition-colors shadow-2xs"
              title="Switch demo persona for testing"
            >
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Role Switcher</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {switcherOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Test Personas
                </div>
                <button
                  onClick={() => handleSwitchDemoRole("admin")}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md hover:bg-muted text-left"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-rose-500" /> Admin
                  </span>
                  {role === "admin" && <span className="text-[10px] text-blue-500">Active</span>}
                </button>
                <button
                  onClick={() => handleSwitchDemoRole("teacher")}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md hover:bg-muted text-left"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Teacher
                  </span>
                  {role === "teacher" && <span className="text-[10px] text-blue-500">Active</span>}
                </button>
                <button
                  onClick={() => handleSwitchDemoRole("student")}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md hover:bg-muted text-left"
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-500" /> Student
                  </span>
                  {role === "student" && <span className="text-[10px] text-blue-500">Active</span>}
                </button>
              </div>
            )}
          </div>

          {/* User Profile or Login Button */}
          {profile ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-xs">
                  {profile.full_name?.charAt(0) || "U"}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight text-foreground line-clamp-1">
                    {profile.full_name}
                  </span>
                  <div className="mt-0.5">{getRoleBadge(role)}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-xl z-50">
                  <div className="p-2 border-b border-border/50">
                    <p className="text-sm font-semibold">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile.email || user?.email || "No email"}</p>
                    <div className="mt-2">{getRoleBadge(role)}</div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard/student"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-md hover:bg-muted"
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-500" />
                      Student Portal
                    </Link>
                    {(role === "admin" || role === "teacher") && (
                      <Link
                        href="/dashboard/teacher"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs rounded-md hover:bg-muted"
                      >
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        Teacher Portal
                      </Link>
                    )}
                    {role === "admin" && (
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs rounded-md hover:bg-muted"
                      >
                        <Shield className="w-4 h-4 text-rose-500" />
                        Admin Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-border/50">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 rounded-md hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

