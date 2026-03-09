import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { fetchOnboardingTextConfiguration, updateOnboardingTextConfiguration } from '../api/admin';
import type { OnboardingTextConfiguration } from '../types/admin';

export function OnboardingTextConfigurationPage() {
  const query = useQuery({ queryKey: ['onboarding-text-configuration'], queryFn: fetchOnboardingTextConfiguration });
  const [draft, setDraft] = useState<OnboardingTextConfiguration | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (query.data) setDraft(query.data);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: (payload: OnboardingTextConfiguration) => updateOnboardingTextConfiguration(payload),
    onSuccess: (data) => {
      setDraft(data);
      setToast('Onboarding text configuration saved');
    },
  });

  if (query.isLoading || !draft) return <p className="text-sm text-slate-500">Loading onboarding text configuration...</p>;
  if (query.isError) return <p className="text-sm text-red-600">Failed to load onboarding text configuration.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Onboarding Steps Text</h2>
        <p className="mt-1 text-sm text-slate-500">Manage titles, subtitles, button text, and per-screen visibility.</p>
      </div>
      {toast ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{toast}</div> : null}
      <div className="space-y-4">
        {draft.screens.map((screen, index) => (
          <section key={screen.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{screen.key}</h3>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={screen.enabled}
                  onChange={(e) =>
                    setDraft((current) =>
                      current
                        ? { ...current, screens: current.screens.map((entry, entryIndex) => entryIndex === index ? { ...entry, enabled: e.target.checked } : entry) }
                        : current
                    )
                  }
                />
                Enabled
              </label>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={screen.title} onChange={(e) => setDraft((current) => current ? { ...current, screens: current.screens.map((entry, entryIndex) => entryIndex === index ? { ...entry, title: e.target.value } : entry) } : current)} placeholder="Title" className="rounded-md border px-3 py-2 text-sm" />
              <input value={screen.subtitle} onChange={(e) => setDraft((current) => current ? { ...current, screens: current.screens.map((entry, entryIndex) => entryIndex === index ? { ...entry, subtitle: e.target.value } : entry) } : current)} placeholder="Subtitle" className="rounded-md border px-3 py-2 text-sm" />
              <input value={screen.primary_cta} onChange={(e) => setDraft((current) => current ? { ...current, screens: current.screens.map((entry, entryIndex) => entryIndex === index ? { ...entry, primary_cta: e.target.value } : entry) } : current)} placeholder="Primary CTA" className="rounded-md border px-3 py-2 text-sm" />
              <input value={screen.secondary_cta} onChange={(e) => setDraft((current) => current ? { ...current, screens: current.screens.map((entry, entryIndex) => entryIndex === index ? { ...entry, secondary_cta: e.target.value } : entry) } : current)} placeholder="Secondary CTA" className="rounded-md border px-3 py-2 text-sm" />
            </div>
          </section>
        ))}
      </div>
      <button onClick={() => mutation.mutate(draft)} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
        Save Onboarding Text
      </button>
    </div>
  );
}
