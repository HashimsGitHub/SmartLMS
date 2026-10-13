"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";
import { Profile, UserRole } from "./types";
import { LocalStorageStore, INITIAL_MOCK_PROFILES } from "./mock-data";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  isMockMode: boolean;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  signUpWithPassword: (email: string, password: string, fullName: string, requestedRole?: UserRole) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  loginAsDemoUser: (role: UserRole) => Promise<{ success: boolean; role: UserRole }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileRole: (userId: string, newRole: UserRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMockMode, setIsMockMode] = useState<boolean>(false);

  const supabase = createClient();

  const fetchProfileFromSupabase = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("[Auth] Supabase profile fetch failed, checking local state:", error.message);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.warn("[Auth] Supabase profile exception:", err);
      return null;
    }
  }, [supabase]);

  // Initial session hydration
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        // 1. Check if an active mock session exists in localStorage
        const localMockUser = LocalStorageStore.getActiveUser();
        if (localMockUser) {
          if (mounted) {
            setProfile(localMockUser);
            setIsMockMode(true);
            setLoading(false);
          }
          return;
        }

        // 2. Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser(session.user);
          const dbProfile = await fetchProfileFromSupabase(session.user.id);
          if (dbProfile) {
            setProfile(dbProfile);
            setIsMockMode(false);
          } else {
            // Profile record doesn't exist yet in Supabase profiles table
            const userMeta = session.user.user_metadata || {};
            const fallbackProfile: Profile = {
              id: session.user.id,
              full_name: userMeta.full_name || session.user.email?.split("@")[0] || "User",
              role: (userMeta.role as UserRole) || "student",
              updated_at: new Date().toISOString(),
              email: session.user.email,
            };
            setProfile(fallbackProfile);
          }
        }
      } catch (err) {
        console.warn("[Auth] Init auth error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          setIsMockMode(false);
          const dbProfile = await fetchProfileFromSupabase(session.user.id);
          if (dbProfile) {
            setProfile(dbProfile);
          } else {
            const userMeta = session.user.user_metadata || {};
            setProfile({
              id: session.user.id,
              full_name: userMeta.full_name || session.user.email?.split("@")[0] || "User",
              role: (userMeta.role as UserRole) || "student",
              updated_at: new Date().toISOString(),
              email: session.user.email,
            });
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setIsMockMode(false);
          LocalStorageStore.setActiveUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfileFromSupabase]);

  const refreshProfile = useCallback(async () => {
    if (isMockMode && profile) {
      const allProfiles = LocalStorageStore.getProfiles();
      const updated = allProfiles.find((p) => p.id === profile.id);
      if (updated) {
        setProfile(updated);
        LocalStorageStore.setActiveUser(updated);
      }
      return;
    }

    if (user) {
      const dbProfile = await fetchProfileFromSupabase(user.id);
      if (dbProfile) setProfile(dbProfile);
    }
  }, [isMockMode, profile, user, fetchProfileFromSupabase]);

  // Sign in with email and password
  const loginWithPassword = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Attempt Supabase sign in
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // If Supabase returns invalid login or unreachable, check if this matches any demo mock user for seamless localhost DX
        const mockMatch = LocalStorageStore.getProfiles().find(
          (p) => p.email?.toLowerCase() === email.toLowerCase()
        );
        if (mockMatch) {
          LocalStorageStore.setActiveUser(mockMatch);
          setProfile(mockMatch);
          setUser(null);
          setIsMockMode(true);
          return { success: true, role: mockMatch.role };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setIsMockMode(false);
        const dbProfile = await fetchProfileFromSupabase(data.user.id);
        const resolvedRole: UserRole = dbProfile?.role || (data.user.user_metadata?.role as UserRole) || "student";
        
        if (dbProfile) {
          setProfile(dbProfile);
        } else {
          setProfile({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || email.split("@")[0],
            role: resolvedRole,
            updated_at: new Date().toISOString(),
            email: data.user.email,
          });
        }
        return { success: true, role: resolvedRole };
      }

      return { success: false, error: "Failed to authenticate." };
    } catch (err: any) {
      // Local fallback loop if Supabase connection drops out
      const mockMatch = LocalStorageStore.getProfiles().find(
        (p) => p.email?.toLowerCase() === email.toLowerCase()
      );
      if (mockMatch) {
        LocalStorageStore.setActiveUser(mockMatch);
        setProfile(mockMatch);
        setIsMockMode(true);
        return { success: true, role: mockMatch.role };
      }
      return { success: false, error: err?.message || "Unexpected network or auth error" };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email, password, full name, and requested role
  const signUpWithPassword = async (
    email: string,
    password: string,
    fullName: string,
    requestedRole: UserRole = "student"
  ) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: requestedRole,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const newProfile: Profile = {
          id: data.user.id,
          full_name: fullName,
          role: requestedRole,
          updated_at: new Date().toISOString(),
          email,
        };

        // Try inserting into profiles table directly
        try {
          await supabase.from("profiles").upsert(newProfile);
        } catch (e) {
          console.warn("[Auth] Direct profile upsert warning:", e);
        }

        setUser(data.user);
        setProfile(newProfile);
        setIsMockMode(false);
        return { success: true, role: requestedRole };
      }

      return { success: false, error: "Could not create account." };
    } catch (err: any) {
      return { success: false, error: err?.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  // One-click demo user login (Admin, Teacher, Student) for local-first testing
  const loginAsDemoUser = async (demoRole: UserRole) => {
    const profiles = LocalStorageStore.getProfiles();
    const target = profiles.find((p) => p.role === demoRole) || INITIAL_MOCK_PROFILES.find((p) => p.role === demoRole)!;
    LocalStorageStore.setActiveUser(target);
    setProfile(target);
    setUser(null);
    setIsMockMode(true);
    setLoading(false);
    return { success: true, role: target.role };
  };

  const signOut = async () => {
    setLoading(true);
    try {
      LocalStorageStore.setActiveUser(null);
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("[Auth] Signout warning:", err);
    } finally {
      setUser(null);
      setProfile(null);
      setIsMockMode(false);
      setLoading(false);
    }
  };

  const updateProfileRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    try {
      if (isMockMode) {
        const profiles = LocalStorageStore.getProfiles();
        const next = profiles.map((p) => (p.id === userId ? { ...p, role: newRole } : p));
        LocalStorageStore.saveProfiles(next);
        if (profile?.id === userId) {
          const updatedSelf = { ...profile, role: newRole };
          setProfile(updatedSelf);
          LocalStorageStore.setActiveUser(updatedSelf);
        }
        return true;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        console.warn("[Auth] Failed to update role in Supabase:", error.message);
        // Fallback to updating in local store
        const profiles = LocalStorageStore.getProfiles();
        const next = profiles.map((p) => (p.id === userId ? { ...p, role: newRole } : p));
        LocalStorageStore.saveProfiles(next);
        return true;
      }

      if (profile?.id === userId) {
        setProfile({ ...profile, role: newRole });
      }
      return true;
    } catch {
      return false;
    }
  };

  const role = profile?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        isMockMode,
        loginWithPassword,
        signUpWithPassword,
        loginAsDemoUser,
        signOut,
        refreshProfile,
        updateProfileRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

