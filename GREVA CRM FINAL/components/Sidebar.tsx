"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";

const adminNav = [
  { href: "/admin-dashboard", label: "Dashboard" },
  { href: "/admin-dashboard/employees", label: "Employees" },
  { href: "/admin-dashboard/leads", label: "Leads" },
];

const employeeNav = [
  { href: "/employee-dashboard", label: "Dashboard" },
  { href: "/employee-dashboard/leads", label: "My Leads" },
  { href: "/employee-dashboard/tasks", label: "Tasks" },
];

export function Sidebar({ role }: { role: "super_admin" | "employee" }) {
  const pathname = usePathname();
  const nav = role === "super_admin" ? adminNav : employeeNav;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <Link href={role === "super_admin" ? "/admin-dashboard" : "/employee-dashboard"} className="font-semibold text-gray-900">
            GREVA CRM
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                pathname === item.href
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={() => signOut().then(() => window.location.href = "/login")}
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
