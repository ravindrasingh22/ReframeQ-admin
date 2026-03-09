import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { fetchPromptTemplates, updatePromptTemplates } from '../api/admin';
import type { PromptTemplateItem } from '../types/admin';

export function PromptsConfigurationPage() {
  const query = useQuery({ queryKey: ['prompt-templates'], queryFn: fetchPromptTemplates });
  const [items, setItems] = useState<PromptTemplateItem[]>([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (query.data) setItems(query.data.items);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: () => updatePromptTemplates(items),
    onSuccess: (data) => {
      setItems(data.items);
      setToast('Prompt templates saved');
    },
  });

  if (query.isLoading) return <p className="text-sm text-slate-500">Loading prompt templates...</p>;
  if (query.isError) return <p className="text-sm text-red-600">Failed to load prompt templates.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Prompts Configuration</h2>
        <p className="mt-1 text-sm text-slate-500">Manage system and developer prompts by use case.</p>
      </div>
      {toast ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{toast}</div> : null}
      <div className="space-y-4">
        {items.map((item, index) => (
          <section key={item.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{item.label}</h3>
                <p className="text-sm text-slate-500">{item.key}</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) => setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, enabled: e.target.checked } : entry))}
                />
                Enabled
              </label>
            </div>
            <div className="mt-4 grid gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-slate-600">System Prompt</span>
                <textarea
                  value={item.system_prompt}
                  onChange={(e) => setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, system_prompt: e.target.value } : entry))}
                  className="min-h-28 w-full rounded-md border px-3 py-2"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-slate-600">Developer Prompt</span>
                <textarea
                  value={item.developer_prompt}
                  onChange={(e) => setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, developer_prompt: e.target.value } : entry))}
                  className="min-h-24 w-full rounded-md border px-3 py-2"
                />
              </label>
            </div>
          </section>
        ))}
      </div>
      <button onClick={() => mutation.mutate()} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
        Save Prompt Templates
      </button>
    </div>
  );
}
