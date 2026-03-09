import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { fetchOnboardingPolicyConfiguration, updateOnboardingPolicyConfiguration } from '../api/admin';
import type { OnboardingPolicyConfiguration } from '../types/admin';

export function OnboardingPolicyConfigurationPage() {
  const query = useQuery({ queryKey: ['onboarding-policy-configuration'], queryFn: fetchOnboardingPolicyConfiguration });
  const [draft, setDraft] = useState<OnboardingPolicyConfiguration | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (query.data) setDraft(query.data);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: (payload: OnboardingPolicyConfiguration) => updateOnboardingPolicyConfiguration(payload),
    onSuccess: (data) => {
      setDraft(data);
      setToast('Onboarding policy configuration saved');
    },
  });

  if (query.isLoading || !draft) return <p className="text-sm text-slate-500">Loading onboarding policy configuration...</p>;
  if (query.isError) return <p className="text-sm text-red-600">Failed to load onboarding policy configuration.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Onboarding Policy</h2>
        <p className="mt-1 text-sm text-slate-500">Enable or disable onboarding paths, user types, and family flows from admin.</p>
      </div>
      {toast ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{toast}</div> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={draft.onboarding_enabled} onChange={(e) => setDraft({ ...draft, onboarding_enabled: e.target.checked })} />
          Onboarding enabled
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={draft.allow_resume} onChange={(e) => setDraft({ ...draft, allow_resume: e.target.checked })} />
          Allow resume
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={draft.allow_family_flows} onChange={(e) => setDraft({ ...draft, allow_family_flows: e.target.checked })} />
          Allow family flows
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={draft.require_invite_for_family_join} onChange={(e) => setDraft({ ...draft, require_invite_for_family_join: e.target.checked })} />
          Require invite for family join
        </label>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Enabled User Types</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {draft.enabled_user_types.map((item, index) => (
            <label key={item.key} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) => setDraft((current) => current ? { ...current, enabled_user_types: current.enabled_user_types.map((entry, entryIndex) => entryIndex === index ? { ...entry, enabled: e.target.checked } : entry) } : current)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Enabled Account Modes</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {draft.enabled_account_modes.map((item, index) => (
            <label key={item.key} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) => setDraft((current) => current ? { ...current, enabled_account_modes: current.enabled_account_modes.map((entry, entryIndex) => entryIndex === index ? { ...entry, enabled: e.target.checked } : entry) } : current)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </section>

      <button onClick={() => mutation.mutate(draft)} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
        Save Onboarding Policy
      </button>
    </div>
  );
}
