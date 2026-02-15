import { DashboardLayout } from "@/components/DashboardLayout";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout allowedRole="super_admin">
      {children}
    </DashboardLayout>
  );
}
