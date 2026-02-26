import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchAuditLogs } from '../api/admin';

export function AuditLogsPage() {
  const [windowPreset, setWindowPreset] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actorEmail, setActorEmail] = useState('');
  const [role, setRole] = useState('');
  const [action, setAction] = useState('');

  const auditQuery = useQuery({
    queryKey: ['audit-logs', windowPreset, startDate, endDate, actorEmail, role, action],
    queryFn: () => fetchAuditLogs({ window: windowPreset, startDate, endDate, actorEmail, role, action })
  });

  const actionOptions = useMemo(() => {
    const values = Array.from(new Set((auditQuery.data?.events ?? []).map((e) => e.action)));
    return values.sort((a, b) => a.localeCompare(b));
  }, [auditQuery.data?.events]);

  if (auditQuery.isLoading) {
    return <p className="text-sm text-slate-500">Loading audit logs...</p>;
  }

  if (auditQuery.isError || !auditQuery.data) {
    return <p className="text-sm text-red-600">Failed to load audit logs.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Audit Logs</h2>
        <p className="mt-1 text-sm text-slate-500">Recent admin actions from the backend audit trail.</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <select
            value={windowPreset}
            onChange={(e) => setWindowPreset(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Custom range</option>
            <option value="24h">Last 24 hours</option>
            <option value="48h">Last 48 hours</option>
            <option value="1d">Last 1 day</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            disabled={Boolean(windowPreset)}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            disabled={Boolean(windowPreset)}
          />
          <input
            value={actorEmail}
            onChange={(e) => setActorEmail(e.target.value)}
            placeholder="Filter by user email"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">All roles</option>
            <option value="admin">admin</option>
            <option value="content_editor">content_editor</option>
            <option value="support">support</option>
            <option value="analyst">analyst</option>
            <option value="app_user">app_user</option>
          </select>
          <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">All actions</option>
            {actionOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Module</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {auditQuery.data.events.map((event) => (
              <tr key={event.id}>
                <td className="px-4 py-3 text-slate-500">{new Date(event.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{event.actor_email}</td>
                <td className="px-4 py-3 text-slate-600">{event.actor_role ?? '-'}</td>
                <td className="px-4 py-3 text-slate-600">{event.action}</td>
                <td className="px-4 py-3 text-slate-600">{event.module}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
