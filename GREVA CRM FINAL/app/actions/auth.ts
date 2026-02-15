"use client";

import { createClient } from "@/lib/supabase/client";
import { Role } from "@/lib/types";

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error: error.message };
  return { data };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function fetchUserRole(): Promise<Role | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  return (data?.role as Role) ?? null;
}
