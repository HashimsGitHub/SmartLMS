"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, Home, LogIn, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function MobileNav() {
  const { profile, role } = useAuth();
  const pathname = usePathname();

  const items = [{ href: "/", label: "Home", icon: Home }];
  if (!profile) {
    items.push({ href: "/login", label: "Sign In", icon: LogIn });
  } else {
    items.push({ href: "/dashboard/student", label: "Student", icon: GraduationCap });
    if (role === "admin" || role === "teacher")
      items.push({ href: "/dashboard/teacher", label: "Teacher", icon: BookOpen });
    if (role === "admin") items.push({ href: "/dashboard/admin", label: "Admin", icon: Shield });
  }

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 min-h-14 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
