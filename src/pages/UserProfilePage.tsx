import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  changeUserPassword,
  createProfileForPrimaryUser,
  fetchProfilesByPrimaryUser,
  fetchSupportedLanguages,
  fetchUserProfile,
  updateChildStatus,
  updateUserProfile
} from '../api/admin';

const COUNTRIES = [
  'United States',
  'India',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Singapore',
  'United Arab Emirates'
];

const MOOD_SCORES: Record<string, number> = {
  overwhelmed: 1,
  confused: 2,
  okay: 3,
  better: 4,
  calm: 5
};

const RANGE_OPTIONS = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '14d', label: '2 weeks', days: 14 },
  { key: '30d', label: '30 days', days: 30 }
] as const;

type MoodRangeKey = (typeof RANGE_OPTIONS)[number]['key'];

function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

function formatShortDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const numericUserId = Number(userId);
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const profileQuery = useQuery({
    queryKey: ['user-profile', numericUserId],
    queryFn: () => fetchUserProfile(numericUserId),
    enabled: Number.isFinite(numericUserId)
  });
  const languagesQuery = useQuery({ queryKey: ['supported-languages'], queryFn: fetchSupportedLanguages });
  const familyQuery = useQuery({
    queryKey: ['profiles', numericUserId],
    queryFn: () => fetchProfilesByPrimaryUser(numericUserId),
    enabled: Number.isFinite(numericUserId) && profileQuery.data?.role === 'app_user'
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { full_name: string; role: string; is_active: boolean; country: string; language: string }) =>
      updateUserProfile(numericUserId, payload),
    onSuccess: async () => {
      setToast({ type: 'ok', text: 'User profile updated' });
      await queryClient.invalidateQueries({ queryKey: ['user-profile', numericUserId] });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => setToast({ type: 'err', text: 'Failed to update user profile' })
  });

  const passwordMutation = useMutation({
    mutationFn: (password: string) => changeUserPassword(numericUserId, password),
    onSuccess: () => {
      setToast({ type: 'ok', text: 'Password updated' });
      setNewPassword('');
    },
    onError: () => setToast({ type: 'err', text: 'Failed to update password' })
  });

  const addFamilyMutation = useMutation({
    mutationFn: (payload: { profile_type: 'child' | 'adult'; display_name: string; age_band: string }) =>
      createProfileForPrimaryUser(numericUserId, {
        profile_type: payload.profile_type,
        display_name: payload.display_name,
        age_band: payload.age_band,
        daily_time_limit_minutes: 60,
        topic_restrictions: [],
        conversation_visibility_rule: 'summary_only'
      }),
    onSuccess: async () => {
      setToast({ type: 'ok', text: 'Family profile created' });
      await queryClient.invalidateQueries({ queryKey: ['profiles', numericUserId] });
    },
    onError: () => setToast({ type: 'err', text: 'Failed to create family profile' })
  });

  const childStatusMutation = useMutation({
    mutationFn: ({ profileId, active }: { profileId: number; active: boolean }) => updateChildStatus(profileId, active),
    onSuccess: async () => {
      setToast({ type: 'ok', text: 'Child profile status updated' });
      await queryClient.invalidateQueries({ queryKey: ['profiles', numericUserId] });
    },
    onError: () => setToast({ type: 'err', text: 'Failed to update child profile status' })
  });

  if (!Number.isFinite(numericUserId)) {
    return <p className="text-sm text-red-600">Invalid user id.</p>;
  }

  if (profileQuery.isLoading) {
    return <p className="text-sm text-slate-500">Loading user profile...</p>;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return <p className="text-sm text-red-600">Failed to load user profile.</p>;
  }

  const profile = profileQuery.data;
  const supportedLanguages = languagesQuery.data?.supported_languages?.length ? languagesQuery.data.supported_languages : ['en'];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to="/users-accounts" className="text-sm text-indigo-600 hover:text-indigo-800">
            Back to users
          </Link>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">User Profile</h2>
          <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
        </div>
      </div>

      {toast ? (
        <div className={`rounded-lg border px-3 py-2 text-sm ${toast.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {toast.text}
        </div>
      ) : null}

      <ProfileForm
        key={`${profile.user_id}-${profile.onboarding_updated_at ?? 'base'}`}
        profile={profile}
        supportedLanguages={supportedLanguages}
        countries={COUNTRIES}
        working={updateMutation.isPending || passwordMutation.isPending}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        onSave={(payload) => updateMutation.mutate(payload)}
        onChangePassword={(password) => passwordMutation.mutate(password)}
        familyProfiles={familyQuery.data?.items ?? []}
        familyLoading={familyQuery.isLoading}
        onAddFamilyProfile={(payload) => addFamilyMutation.mutate(payload)}
        onToggleChildStatus={(profileId, active) => childStatusMutation.mutate({ profileId, active })}
      />
    </div>
  );
}

function ProfileForm({
  profile,
  supportedLanguages,
  countries,
  working,
  newPassword,
  setNewPassword,
  onSave,
  onChangePassword,
  familyProfiles,
  familyLoading,
  onAddFamilyProfile,
  onToggleChildStatus
}: {
  profile: Awaited<ReturnType<typeof fetchUserProfile>>;
  supportedLanguages: string[];
  countries: string[];
  working: boolean;
  newPassword: string;
  setNewPassword: (value: string) => void;
  onSave: (payload: { full_name: string; role: string; is_active: boolean; country: string; language: string }) => void;
  onChangePassword: (password: string) => void;
  familyProfiles: Awaited<ReturnType<typeof fetchProfilesByPrimaryUser>>['items'];
  familyLoading: boolean;
  onAddFamilyProfile: (payload: { profile_type: 'child' | 'adult'; display_name: string; age_band: string }) => void;
  onToggleChildStatus: (profileId: number, active: boolean) => void;
}) {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [role, setRole] = useState(profile.role);
  const [isActive, setIsActive] = useState(profile.is_active);
  const [country, setCountry] = useState(profile.country);
  const [language, setLanguage] = useState(profile.language || supportedLanguages[0] || 'en');
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileType, setNewProfileType] = useState<'child' | 'adult'>('child');
  const [newProfileAgeBand, setNewProfileAgeBand] = useState('13_15');
  const [moodRange, setMoodRange] = useState<MoodRangeKey>('7d');
  const onboardingState = profile.onboarding_state ?? {};
  const firstReframe = (onboardingState.first_reframe_snapshot as Record<string, unknown> | undefined) ?? null;
  const familyCount = familyProfiles.length;
  const childCount = familyProfiles.filter((item) => item.profile_type === 'child').length;
  const inferredPlan = profile.role === 'app_user' ? ((onboardingState.account_mode as string) === 'family_owner' ? 'Family Plan' : 'Individual Plan') : 'Admin Account';
  const moodLogs = profile.mood_logs ?? [];
  const latestMood = moodLogs[0]?.mood_label ?? '-';
  const filteredMoodLogs = useMemo(() => {
    const range = RANGE_OPTIONS.find((item) => item.key === moodRange) ?? RANGE_OPTIONS[2];
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - (range.days - 1));
    start.setHours(0, 0, 0, 0);
    return moodLogs
      .filter((item) => {
        const date = new Date(item.checkin_date);
        return !Number.isNaN(date.getTime()) && date >= start && date <= end;
      })
      .slice()
      .sort((a, b) => a.checkin_date.localeCompare(b.checkin_date));
  }, [moodLogs, moodRange]);
  const moodTrend = useMemo(() => {
    const scored = filteredMoodLogs
      .map((item) => MOOD_SCORES[item.mood_id] ?? 0)
      .filter((item) => item > 0);
    if (scored.length < 4) {
      return { label: 'Not enough data', tone: 'slate', detail: 'Need a few more check-ins to detect a pattern.' };
    }
    const midpoint = Math.floor(scored.length / 2);
    const firstHalf = average(scored.slice(0, midpoint));
    const secondHalf = average(scored.slice(midpoint));
    const delta = secondHalf - firstHalf;
    if (delta >= 0.45) {
      return { label: 'Improving', tone: 'emerald', detail: 'Recent mood check-ins are trending more positive.' };
    }
    if (delta <= -0.45) {
      return { label: 'Declining', tone: 'rose', detail: 'Recent mood check-ins are trending lower than the earlier period.' };
    }
    return { label: 'Stable', tone: 'amber', detail: 'Mood pattern is relatively steady across the selected range.' };
  }, [filteredMoodLogs]);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Account State" value={profile.is_active ? 'Active' : 'Paused'} hint={profile.role} />
        <MetricCard label="Onboarding" value={profile.onboarding_completed ? 'Completed' : profile.onboarding_step || 'welcome'} hint={`Updated ${formatDate(profile.onboarding_updated_at)}`} />
        <MetricCard label="Family Profiles" value={String(familyCount)} hint={`${childCount} child profiles`} />
        <MetricCard label="Latest Mood" value={latestMood} hint={moodLogs[0] ? formatDate(moodLogs[0].updated_at) : 'No check-ins yet'} />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Profile Details</h3>
        <p className="mt-1 text-sm text-slate-500">Member since: {formatDate(profile.member_since)}</p>
        {profile.invite_code ? <p className="mt-1 text-sm text-indigo-600">Invite code: {profile.invite_code}</p> : null}

        <div className="mt-4 grid grid-cols-1 gap-3">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="rounded-lg border px-3 py-2 text-sm" />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            <option value="admin">admin</option>
            <option value="content_editor">content_editor</option>
            <option value="support">support</option>
            <option value="analyst">analyst</option>
            <option value="app_user">app_user</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active
          </label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            <option value="">Select country</option>
            {countries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            {supportedLanguages.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 p-3">
          <p className="text-sm font-medium text-slate-800">Password Change</p>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min 8 chars)"
            className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
          />
          <button
            disabled={working || newPassword.length < 8}
            onClick={() => onChangePassword(newPassword)}
            className="mt-2 rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-60"
          >
            {working ? 'Updating...' : 'Change Password'}
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={() => onSave({ full_name: fullName, role, is_active: isActive, country, language: language || 'en' })}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Save Profile
          </button>
        </div>
        </section>

        <section className="space-y-6">
          <Panel title="Analytics">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatRow label="Primary goal" value={String(onboardingState.primary_goal ?? '-')} />
              <StatRow label="Coach style" value={String(onboardingState.coach_style ?? '-')} />
              <StatRow label="Reminder preference" value={String(onboardingState.reminder_preference ?? '-')} />
              <StatRow label="Invite validated" value={onboardingState.invite_validated ? 'Yes' : 'No'} />
              <StatRow label="Mental noise" value={String(onboardingState.noise ?? '-')} />
              <StatRow label="Readiness" value={String(onboardingState.readiness ?? '-')} />
            </div>
          </Panel>

          <Panel title="Payments">
            <div className="space-y-2 text-sm text-slate-600">
              <p>Plan: {inferredPlan}</p>
              <p>Billing status: Not connected</p>
              <p>Invoice history: No payment ledger available in current backend.</p>
            </div>
          </Panel>

          <Panel title="Admin Actions">
            <div className="space-y-2 text-sm text-slate-600">
              <p>Use the profile form to update role, locale, and activation state.</p>
              <p>Use password change above for account recovery or reset.</p>
              <p>Family profiles can be managed below for `app_user` accounts.</p>
            </div>
          </Panel>
        </section>
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Panel title="First Reframe Snapshot">
          {!firstReframe ? (
            <p className="text-sm text-slate-500">No first reframe has been saved for this user yet.</p>
          ) : (
            <div className="space-y-3">
              <SnapshotRow label="User thought" value={String(firstReframe.user_thought ?? firstReframe.thought ?? '-')} />
              <SnapshotRow label="Pattern label" value={String(firstReframe.pattern_label ?? firstReframe.patternLabel ?? '-')} />
              <SnapshotRow label="Reframe" value={String(firstReframe.reframe_text ?? firstReframe.reframeText ?? '-')} />
              <SnapshotRow label="Next step" value={String(firstReframe.next_step_text ?? firstReframe.nextStepText ?? '-')} />
              <SnapshotRow label="Question" value={String(firstReframe.question_text ?? firstReframe.questionText ?? '-')} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatRow label="Config version" value={String(firstReframe.config_version ?? firstReframe.configVersion ?? '-')} />
                <StatRow label="Fallback used" value={firstReframe.fallback_used || firstReframe.fallbackUsed ? 'Yes' : 'No'} />
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Profile State">
          <div className="rounded-lg bg-slate-50 p-3">
            <pre className="whitespace-pre-wrap break-words text-xs text-slate-700">
              {JSON.stringify(profile.onboarding_state ?? {}, null, 2)}
            </pre>
          </div>
        </Panel>

        <Panel title="Mood Check-ins">
          {profile.role !== 'app_user' ? (
            <p className="text-sm text-slate-500">Mood logs are available for app users only.</p>
          ) : moodLogs.length === 0 ? (
            <p className="text-sm text-slate-500">No mood check-ins have been recorded for this user yet.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold ${moodTrend.tone === 'emerald' ? 'text-emerald-700' : moodTrend.tone === 'rose' ? 'text-rose-700' : moodTrend.tone === 'amber' ? 'text-amber-700' : 'text-slate-700'}`}>
                    Mood trend: {moodTrend.label}
                  </p>
                  <p className="text-xs text-slate-500">{moodTrend.detail}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setMoodRange(option.key)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${moodRange === option.key ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <MoodTrendChart items={filteredMoodLogs} />

              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Mood</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Mood ID</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredMoodLogs
                      .slice()
                      .reverse()
                      .map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-slate-700">{item.checkin_date}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{item.mood_label}</td>
                          <td className="px-4 py-3 text-slate-500">{item.mood_id}</td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(item.updated_at)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {filteredMoodLogs.length === 0 ? (
                <p className="text-sm text-slate-500">No mood check-ins found in the selected time range.</p>
              ) : null}
            </div>
          )}
        </Panel>

        <Panel title="Family List">
          {profile.role !== 'app_user' ? (
            <p className="text-sm text-slate-500">Family management is available for app users only.</p>
          ) : familyLoading ? (
            <p className="text-sm text-slate-500">Loading family profiles...</p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {familyProfiles.length === 0 ? <p className="text-sm text-slate-500">No family profiles yet.</p> : null}
                {familyProfiles.map((item) => (
                  <div key={item.profile_id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.display_name}</p>
                        <p className="text-xs text-slate-500">
                          {item.profile_type} • {item.age_band} • {item.conversation_visibility_rule ?? 'n/a'}
                        </p>
                      </div>
                      {item.profile_type === 'child' ? (
                        <button
                          onClick={() => onToggleChildStatus(item.profile_id, !item.profile_active)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          {item.profile_active ? 'Deactivate' : 'Activate'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-800">Add Family Profile</p>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <select value={newProfileType} onChange={(e) => setNewProfileType(e.target.value as 'child' | 'adult')} className="rounded-md border px-2 py-2 text-sm">
                    <option value="child">Child</option>
                    <option value="adult">Adult</option>
                  </select>
                  <input value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} placeholder="Profile name" className="rounded-md border px-2 py-2 text-sm" />
                  <input value={newProfileAgeBand} onChange={(e) => setNewProfileAgeBand(e.target.value)} placeholder="Age band" className="rounded-md border px-2 py-2 text-sm" />
                  <button
                    onClick={() => {
                      if (!newProfileName.trim()) return;
                      onAddFamilyProfile({ profile_type: newProfileType, display_name: newProfileName.trim(), age_band: newProfileAgeBand.trim() || '13_15' });
                      setNewProfileName('');
                    }}
                    className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
                  >
                    Add Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{value}</p>
    </div>
  );
}

function MoodTrendChart({
  items
}: {
  items: Array<{
    id: number;
    mood_id: string;
    mood_label: string;
    checkin_date: string;
    updated_at: string;
  }>;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    id: number;
    moodLabel: string;
    moodId: string;
    checkinDate: string;
    updatedAt: string;
    score: number;
    left: number;
    top: number;
  } | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        No graph available for this filter yet.
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const paddingX = 24;
  const paddingY = 28;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const stepX = items.length > 1 ? innerWidth / (items.length - 1) : 0;
  const points = items.map((item, index) => {
    const score = MOOD_SCORES[item.mood_id] ?? 3;
    const x = paddingX + stepX * index;
    const y = paddingY + (5 - score) * (innerHeight / 4);
    return { ...item, score, x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="relative rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-800">Mood pattern</p>
          <p className="text-xs text-slate-500">Daily mood score across the selected range. Hover the line to inspect a day.</p>
        </div>
        <div className="text-xs text-slate-500">Higher line = calmer / better</div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" onMouseLeave={() => setHoveredPoint(null)}>
        {[1, 2, 3, 4, 5].map((score) => {
          const y = paddingY + (5 - score) * (innerHeight / 4);
          return (
            <g key={score}>
              <line x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#cbd5e1" strokeDasharray="4 4" />
              <text x={6} y={y + 4} fontSize="11" fill="#64748b">
                {score}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="rgba(99,102,241,0.12)" />
        <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point) => (
          <g key={point.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredPoint?.id === point.id ? '7' : '4.5'}
              fill="#4f46e5"
              onMouseEnter={() =>
                setHoveredPoint({
                  id: point.id,
                  moodLabel: point.mood_label,
                  moodId: point.mood_id,
                  checkinDate: point.checkin_date,
                  updatedAt: point.updated_at,
                  score: point.score,
                  left: (point.x / width) * 100,
                  top: (point.y / height) * 100
                })
              }
              onMouseMove={() =>
                setHoveredPoint({
                  id: point.id,
                  moodLabel: point.mood_label,
                  moodId: point.mood_id,
                  checkinDate: point.checkin_date,
                  updatedAt: point.updated_at,
                  score: point.score,
                  left: (point.x / width) * 100,
                  top: (point.y / height) * 100
                })
              }
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="14"
              fill="transparent"
              onMouseEnter={() =>
                setHoveredPoint({
                  id: point.id,
                  moodLabel: point.mood_label,
                  moodId: point.mood_id,
                  checkinDate: point.checkin_date,
                  updatedAt: point.updated_at,
                  score: point.score,
                  left: (point.x / width) * 100,
                  top: (point.y / height) * 100
                })
              }
            />
            <text x={point.x} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748b">
              {formatShortDate(point.checkin_date)}
            </text>
          </g>
        ))}
      </svg>
      {hoveredPoint ? (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${Math.min(Math.max(hoveredPoint.left, 10), 88)}%`,
            top: `${Math.min(Math.max(hoveredPoint.top - 10, 8), 70)}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <p className="font-semibold text-slate-900">{hoveredPoint.moodLabel}</p>
          <p className="text-slate-500">{hoveredPoint.checkinDate}</p>
          <p className="text-slate-500">Mood ID: {hoveredPoint.moodId}</p>
          <p className="text-slate-500">Score: {hoveredPoint.score} / 5</p>
          <p className="text-slate-500">Updated: {formatDate(hoveredPoint.updatedAt)}</p>
        </div>
      ) : null}
    </div>
  );
}
