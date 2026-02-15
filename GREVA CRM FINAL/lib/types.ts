export type Role = "super_admin" | "employee";

export type LeadStatus =
  | "new"
  | "contacted"
  | "follow_up"
  | "closed"
  | "lost";

export type TaskStatus = "pending" | "completed";

export interface User {
  id: string;
  name: string | null;
  role: Role;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  deal_value: number | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  lead_id: string;
  user_id: string;
  note_text: string;
  created_at: string;
}

export interface Task {
  id: string;
  lead_id: string;
  assigned_to: string;
  due_date: string | null;
  status: TaskStatus;
}
