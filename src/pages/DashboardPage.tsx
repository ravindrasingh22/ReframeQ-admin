import { useQuery } from '@tanstack/react-query';

import { fetchAnalyticsOverview } from '../api/admin';

export function DashboardPage() {
  const analyticsQuery = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: fetchAnalyticsOverview
  });

  if (analyticsQuery.isLoading) {
    return <p className="text-sm text-slate-500">Loading overview...</p>;
  }

  if (analyticsQuery.isError || !analyticsQuery.data) {
    return <p className="text-sm text-red-600">Failed to load overview data.</p>;
  }

  const summary = analyticsQuery.data.summary;
  const stats = [
    { label: 'Daily active users', value: String(summary.dau) },
    { label: 'Exercise completion rate', value: `${summary.journey_completion_rate}%` },
    { label: 'Sensitive content detections', value: String(summary.sensitive_content_detections) },
    { label: 'Top journey', value: summary.top_journey }
  ];

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
