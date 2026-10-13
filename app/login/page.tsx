"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import {
  GraduationCap,
  Shield,
  BookOpen,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPassword, signUpWithPassword, loginAsDemoUser } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");

  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const routeByRole = (role?: UserRole) => {
    switch (role) {
      case "admin":
        router.push("/dashboard/admin");
        break;
      case "teacher":
        router.push("/dashboard/teacher");
        break;
      case "student":
      default:
        router.push("/dashboard/student");
        break;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithPassword(email, password);
      if (result.success) {
        setSuccessMessage(`Authenticated successfully as ${result.role || "student"}. Redirecting...`);
        setTimeout(() => {
          routeByRole(result.role);
        }, 500);
      } else {
        setErrorMessage(result.error || "Authentication failed.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password || !fullName) {
      setErrorMessage("Please fill in all registration fields.");
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithPassword(email, password, fullName, selectedRole);
      if (result.success) {
        setSuccessMessage(`Account created for ${fullName}! Routing to portal...`);
        setTimeout(() => {
          routeByRole(result.role);
        }, 600);
      } else {
        setErrorMessage(result.error || "Sign up failed.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: UserRole) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setDemoLoading(demoRole);

    try {
      const res = await loginAsDemoUser(demoRole);
      setSuccessMessage(`Logged in as demo ${demoRole.toUpperCase()}. Redirecting...`);
      setTimeout(() => {
        routeByRole(res.role);
      }, 400);
    } catch (err: any) {
      setErrorMessage(err?.message || "Demo login failed");
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-1">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome to SmartLMS
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Secure, role-based learning management powered by Supabase & Azure Blob Media.
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-sm">
          {/* Sign In / Sign Up toggle */}
          <div className="flex rounded-xl bg-muted p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Desired Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["student", "teacher", "admin"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRole(r)}
                        className={`py-2 px-2 text-xs font-medium rounded-lg border capitalize transition-all ${
                          selectedRole === r
                            ? "border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="name@smartlms.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Quick Prefill Pill Helpers */}
            {mode === "signin" && (
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Quick Fill:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@smartlms.edu");
                      setPassword("Password123!");
                    }}
                    className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-mono text-[10px] cursor-pointer"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("teacher@smartlms.edu");
                      setPassword("Password123!");
                    }}
                    className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-mono text-[10px] cursor-pointer"
                  >
                    Teacher
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("student@smartlms.edu");
                      setPassword("Password123!");
                    }}
                    className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-mono text-[10px] cursor-pointer"
                  >
                    Student
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!demoLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In to SmartLMS" : "Complete Registration"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Personas - Local-First Testability */}
          <div className="mt-8 pt-6 border-t border-border/60">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Instant Demo Access (Local-First)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Click any role persona to immediately test its dashboard without typing credentials:
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("admin")}
                disabled={loading || !!demoLoading}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-all text-center group cursor-pointer disabled:opacity-50"
              >
                {demoLoading === "admin" ? (
                  <Loader2 className="w-4 h-4 animate-spin my-1" />
                ) : (
                  <Shield className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-semibold">Admin</span>
                <span className="text-[10px] text-muted-foreground">Full CRUD</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("teacher")}
                disabled={loading || !!demoLoading}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-all text-center group cursor-pointer disabled:opacity-50"
              >
                {demoLoading === "teacher" ? (
                  <Loader2 className="w-4 h-4 animate-spin my-1" />
                ) : (
                  <BookOpen className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-semibold">Teacher</span>
                <span className="text-[10px] text-muted-foreground">Course Mgr</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("student")}
                disabled={loading || !!demoLoading}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all text-center group cursor-pointer disabled:opacity-50"
              >
                {demoLoading === "student" ? (
                  <Loader2 className="w-4 h-4 animate-spin my-1" />
                ) : (
                  <GraduationCap className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-semibold">Student</span>
                <span className="text-[10px] text-muted-foreground">Video Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

