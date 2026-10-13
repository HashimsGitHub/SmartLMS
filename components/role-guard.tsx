"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import { Loader2, ShieldAlert } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { profile, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!profile) {
      // Not logged in -> redirect to login
      router.replace("/login");
      return;
    }

    if (role && !allowedRoles.includes(role)) {
      // Role is not allowed on this route
      if (role === "student") {
        router.replace("/dashboard/student");
      } else if (role === "teacher") {
        router.replace("/dashboard/teacher");
      } else {
        router.replace("/dashboard/student");
      }
    }
  }, [profile, role, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Authenticating SmartLMS permissions...
        </p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  if (role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Your account role (<span className="font-semibold uppercase">{role}</span>) does not have permission to view this administrative endpoint. Redirecting to your authorized dashboard...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

