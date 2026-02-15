"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdminKey } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getStats() {
  const supabase = await createClient();
  const [leadsRes, employeesRes, revenueRes] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "employee"),
    supabase.from("leads").select("deal_value").eq("status", "closed"),
  ]);
  const totalLeads = leadsRes.count ?? 0;
  const totalEmployees = employeesRes.count ?? 0;
  const totalRevenue = (revenueRes.data ?? []).reduce((s, r) => s + Number(r.deal_value ?? 0), 0);
  return { totalLeads, totalEmployees, totalRevenue };
}

export async function getEmployees() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, role, created_at")
    .eq("role", "employee")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUsersForAssign() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, name")
    .eq("role", "employee")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addEmployee(formData: FormData) {
  if (!hasAdminKey()) {
    return { error: "Server: SUPABASE_SERVICE_ROLE_KEY not set. Add employees from Supabase Dashboard." };
  }
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string) || null;
  if (!email?.trim() || !password) return { error: "Email and password required." };
  const admin = createAdminClient();
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  });
  if (authError) return { error: authError.message };
  const userId = authData.user.id;
  const { error: dbError } = await admin
    .from("users")
    .insert({ id: userId, name: name?.trim() || null, role: "employee" });
  if (dbError) return { error: dbError.message };
  revalidatePath("/admin-dashboard");
  revalidatePath("/admin-dashboard/employees");
  return { success: true };
}

export async function getLeadsAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(`
      id, name, phone, source, status, deal_value, assigned_to, created_by, created_at,
      assignee:users!leads_assigned_to_fkey(name)
    `)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addLead(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const name = formData.get("name") as string;
  const phone = (formData.get("phone") as string) || null;
  const source = (formData.get("source") as string) || null;
  const status = (formData.get("status") as string) || "new";
  const dealValue = formData.get("deal_value") ? Number(formData.get("deal_value")) : null;
  const assignedTo = (formData.get("assigned_to") as string) || null;
  if (!name?.trim()) return { error: "Lead name required." };
  const { error } = await supabase.from("leads").insert({
    name: name.trim(),
    phone: phone?.trim() || null,
    source: source?.trim() || null,
    status,
    deal_value: dealValue ?? 0,
    assigned_to: assignedTo || null,
    created_by: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin-dashboard");
  revalidatePath("/admin-dashboard/leads");
  return { success: true };
}

export async function updateLead(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const phone = (formData.get("phone") as string) || null;
  const source = (formData.get("source") as string) || null;
  const status = formData.get("status") as string;
  const dealValue = formData.get("deal_value") ? Number(formData.get("deal_value")) : null;
  const assignedTo = (formData.get("assigned_to") as string) || null;
  if (!name?.trim()) return { error: "Lead name required." };
  const { error } = await supabase
    .from("leads")
    .update({
      name: name.trim(),
      phone: phone?.trim() || null,
      source: source?.trim() || null,
      status,
      deal_value: dealValue ?? 0,
      assigned_to: assignedTo || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin-dashboard");
  revalidatePath("/admin-dashboard/leads");
  return { success: true };
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin-dashboard");
  revalidatePath("/admin-dashboard/leads");
  return { success: true };
}
