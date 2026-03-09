import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { fetchModelConfiguration, updateModelConfiguration } from '../api/admin';
import type { ModelConfiguration } from '../types/admin';

export function ModelConfigurationPage() {
  const query = useQuery({ queryKey: ['model-configuration'], queryFn: fetchModelConfiguration });
  const [draft, setDraft] = useState<ModelConfiguration | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (query.data) setDraft(query.data);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: (payload: ModelConfiguration) => updateModelConfiguration(payload),
    onSuccess: (data) => {
      setDraft(data);
      setToast('Model configuration saved');
    },
  });

  if (query.isLoading || !draft) return <p className="text-sm text-slate-500">Loading model configuration...</p>;
  if (query.isError) return <p className="text-sm text-red-600">Failed to load model configuration.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Model Configuration</h2>
        <p className="mt-1 text-sm text-slate-500">Control the default provider, model names, base URL, and timeout.</p>
      </div>
      {toast ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{toast}</div> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Provider</span>
            <input value={draft.provider} onChange={(e) => setDraft({ ...draft, provider: e.target.value })} className="w-full rounded-md border px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Base URL</span>
            <input value={draft.base_url} onChange={(e) => setDraft({ ...draft, base_url: e.target.value })} className="w-full rounded-md border px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Default Model</span>
            <input value={draft.default_model} onChange={(e) => setDraft({ ...draft, default_model: e.target.value })} className="w-full rounded-md border px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Onboarding Model</span>
            <input value={draft.onboarding_model} onChange={(e) => setDraft({ ...draft, onboarding_model: e.target.value })} className="w-full rounded-md border px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Fallback Model</span>
            <input value={draft.fallback_model} onChange={(e) => setDraft({ ...draft, fallback_model: e.target.value })} className="w-full rounded-md border px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Timeout Seconds</span>
            <input type="number" value={draft.timeout_seconds} onChange={(e) => setDraft({ ...draft, timeout_seconds: Number(e.target.value) })} className="w-full rounded-md border px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Temperature</span>
            <input type="number" step="0.1" value={draft.temperature} onChange={(e) => setDraft({ ...draft, temperature: Number(e.target.value) })} className="w-full rounded-md border px-3 py-2" />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} />
            AI model access enabled
          </label>
        </div>
      </section>
      <button onClick={() => mutation.mutate(draft)} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
        Save Model Configuration
      </button>
    </div>
  );
}
