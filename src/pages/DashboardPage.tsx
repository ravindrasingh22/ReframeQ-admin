const stats = [
  { label: 'Daily active users', value: '1,248' },
  { label: 'Exercise completion rate', value: '68%' },
  { label: 'Sensitive content detections', value: '17' },
  { label: 'Top journey', value: 'Overthinking Reset' }
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Overview</h2>
        <p className="mt-1 text-sm text-slate-500">
          Wellness product metrics for learning journeys, skills practice, and engagement quality.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
