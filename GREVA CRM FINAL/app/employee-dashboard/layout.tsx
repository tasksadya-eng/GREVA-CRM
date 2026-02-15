import { DashboardLayout } from "@/components/DashboardLayout";

export default function EmployeeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout allowedRole="employee">
      {children}
    </DashboardLayout>
  );
}
