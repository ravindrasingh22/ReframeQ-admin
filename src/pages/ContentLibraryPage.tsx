import { useQuery } from '@tanstack/react-query';

import { fetchJourneys } from '../api/admin';

export function ContentLibraryPage() {
  const journeysQuery = useQuery({
    queryKey: ['journeys'],
    queryFn: fetchJourneys
  });

  if (journeysQuery.isLoading) {
    return <p className="text-sm text-slate-500">Loading content library...</p>;
  }

  if (journeysQuery.isError || !journeysQuery.data) {
    return <p className="text-sm text-red-600">Failed to load journeys.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Content Library</h2>
        <p className="mt-1 text-sm text-slate-500">Journeys and exercises powered by backend content APIs.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {journeysQuery.data.items.map((journey) => (
          <article key={journey.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">{journey.topic}</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{journey.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{journey.summary}</p>
            <p className="mt-3 text-xs text-slate-500">
              Difficulty: {journey.difficulty} • {journey.is_published ? 'Published' : 'Draft'}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
