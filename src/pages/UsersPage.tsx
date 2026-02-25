const users = [
  { name: 'Maya Shah', role: 'Guardian', status: 'Active', limits: '60 min/day' },
  { name: 'Arjun Nair', role: 'User (Teen)', status: 'Paused', limits: '45 min/day' },
  { name: 'Leah Carter', role: 'User (Adult)', status: 'Active', limits: '90 min/day' }
];

export function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Users & Accounts</h2>
        <p className="mt-1 text-sm text-slate-500">
          Account operations, guardian controls, access roles, and privacy requests.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Session limit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map((user) => (
              <tr key={user.name}>
                <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                <td className="px-4 py-3 text-slate-600">{user.role}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{user.limits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
