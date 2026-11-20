"use client";

import { BookOpen, LayoutDashboard, ListChecks, Tags } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/tasks", label: "Quizzes & practice", icon: ListChecks },
  { href: "/admin/lectures", label: "Lectures", icon: BookOpen },
  { href: "/admin/skills", label: "Skills", icon: Tags },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="border-b border-paper-3 bg-white">
      <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 sm:px-8">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3.5 text-sm font-semibold transition-colors ${
                  active ? "border-gold-500 text-forest-800" : "border-transparent text-ink-muted hover:text-forest-700"
                }`}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
