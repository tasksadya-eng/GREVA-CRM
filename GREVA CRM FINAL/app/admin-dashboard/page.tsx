import Link from "next/link";
import { getStats } from "@/app/actions/admin";

export default async function AdminDashboardPage() {
  let stats = { totalLeads: 0, totalEmployees: 0, totalRevenue: 0 };
  try {
    stats = await getStats();
  } catch (e) {
    console.error(e);
  }
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview and quick actions</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Leads" value={stats.totalLeads} />
        <StatCard title="Employees" value={stats.totalEmployees} />
        <StatCard title="Total Revenue" value={`$${Number(stats.totalRevenue).toLocaleString()}`} />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin-dashboard/employees"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Manage Employees
        </Link>
        <Link
          href="/admin-dashboard/leads"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Manage Leads
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
