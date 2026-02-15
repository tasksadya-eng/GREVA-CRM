import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./Sidebar";
import { Role } from "@/lib/types";

export async function DashboardLayout({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: Role;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role as Role | null;
  if (!role) redirect("/login");
  if (role !== allowedRole) {
    if (role === "super_admin") redirect("/admin-dashboard");
    redirect("/employee-dashboard");
  }
  return (
    <div className="min-h-screen bg-white">
      <Sidebar role={role} />
      <main className="pl-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
