import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { fetchFirstReframeConfig, previewFirstReframe, updateFirstReframeConfig } from '../api/admin';
import type { FirstReframeConfig } from '../types/admin';

export function OnboardingAIPage() {
  const configQuery = useQuery({ queryKey: ['first-reframe-config'], queryFn: fetchFirstReframeConfig });
  const [draft, setDraft] = useState<FirstReframeConfig | null>(null);
  const [previewThought, setPreviewThought] = useState("I'm falling behind");
  const [toast, setToast] = useState<string>('');

  useEffect(() => {
    if (configQuery.data) setDraft(configQuery.data);
  }, [configQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload: FirstReframeConfig) => updateFirstReframeConfig(payload),
    onSuccess: (data) => {
      setDraft(data);
      setToast('Configuration saved');
    },
  });

  const previewMutation = useMutation({
    mutationFn: () =>
      previewFirstReframe({
        user_thought: previewThought,
        user_type: 'adult',
        account_mode: 'individual',
        goal: 'focus',
        secondary_goals: [],
        clarity_score: 30,
        control_score: 40,
        mental_noise_score: 80,
        readiness_score: 50,
        coach_style: 'practical',
        language: 'en',
        country: 'IN',
      }),
  });

  if (configQuery.isLoading || !draft) return <p className="text-sm text-slate-500">Loading onboarding AI config...</p>;
  if (configQuery.isError) return <p className="text-sm text-red-600">Failed to load onboarding AI config.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Onboarding AI</h2>
        <p className="mt-1 text-sm text-slate-500">Configure and preview the dedicated `first_reframe` onboarding step.</p>
      </div>

      {toast ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{toast}</div> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Step Config</h3>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Model</span>
              <input value={draft.model_name} onChange={(e) => setDraft({...draft, model_name: e.target.value})} className="w-full rounded-md border px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Schema version</span>
              <input value={draft.schema_version} onChange={(e) => setDraft({...draft, schema_version: e.target.value})} className="w-full rounded-md border px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">System prompt</span>
              <textarea value={draft.system_prompt} onChange={(e) => setDraft({...draft, system_prompt: e.target.value})} className="min-h-40 w-full rounded-md border px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Developer prompt</span>
              <textarea value={draft.developer_prompt} onChange={(e) => setDraft({...draft, developer_prompt: e.target.value})} className="min-h-24 w-full rounded-md border px-3 py-2" />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={draft.show_pattern_label} onChange={(e) => setDraft({...draft, show_pattern_label: e.target.checked})} />
              Show pattern label
            </label>
            <button onClick={() => saveMutation.mutate(draft)} className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white">
              Save Config
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Preview</h3>
          <textarea value={previewThought} onChange={(e) => setPreviewThought(e.target.value)} className="mt-4 min-h-24 w-full rounded-md border px-3 py-2" />
          <button onClick={() => previewMutation.mutate()} className="mt-3 rounded-md border border-slate-300 px-3 py-2 text-sm">
            {previewMutation.isPending ? 'Generating...' : 'Generate Preview'}
          </button>

          {previewMutation.data ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <p>Model: {previewMutation.data.model || 'fallback'}</p>
                <p>Fallback used: {previewMutation.data.result.fallback_used ? 'Yes' : 'No'}</p>
              </div>
              <div className="rounded-xl bg-slate-950 px-4 py-3 text-white">
                <p className="text-xs uppercase tracking-wide text-slate-400">Your thought</p>
                <p className="mt-1 text-sm">{previewThought}</p>
              </div>
              <div className="rounded-xl bg-violet-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-violet-700">A different way to look at it</p>
                <p className="mt-1 text-sm text-slate-800">{String(previewMutation.data.result.reframe_text ?? '')}</p>
              </div>
              <div className="rounded-xl bg-amber-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-amber-700">Try this next</p>
                <p className="mt-1 text-sm text-slate-800">{String(previewMutation.data.result.next_step_text ?? '')}</p>
              </div>
              <div className="rounded-xl bg-violet-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-violet-700">One question to test it</p>
                <p className="mt-1 text-sm text-slate-800">{String(previewMutation.data.result.question_text ?? '')}</p>
              </div>
              <pre className="overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                {JSON.stringify(previewMutation.data.result, null, 2)}
              </pre>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
