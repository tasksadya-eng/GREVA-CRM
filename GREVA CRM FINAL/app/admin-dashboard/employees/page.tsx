import { getEmployees } from "@/app/actions/admin";
import { hasAdminKey } from "@/lib/supabase/admin";
import { AddEmployeeForm } from "./AddEmployeeForm";

export default async function EmployeesPage() {
  const canAdd = hasAdminKey();
  let employees: { id: string; name: string | null; role: string; created_at: string }[] = [];
  let error: string | null = null;
  try {
    employees = await getEmployees();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load employees";
  }
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <p className="mt-1 text-sm text-gray-500">Manage team access</p>
        </div>
        {canAdd && <AddEmployeeForm />}
      </div>
      {!canAdd && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          To add employees from this app, set <code className="rounded bg-amber-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> in your server environment. Otherwise create users in Supabase Auth and add a row to the <code className="rounded bg-amber-100 px-1">users</code> table with <code className="rounded bg-amber-100 px-1">role = &apos;employee&apos;</code>.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">
                  No employees yet.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{emp.name ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{emp.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(emp.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
