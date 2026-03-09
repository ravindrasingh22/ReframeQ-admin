import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import {
  bulkUserAction,
  createUser,
  createProfileForPrimaryUser,
  deleteChildProfile,
  deleteUser,
  fetchProfilesByPrimaryUser,
  fetchSupportedLanguages,
  fetchUsers,
  getChildConsent,
  recordChildConsent,
  updateChildProfile,
  updateChildStatus,
  updateUser
} from '../api/admin';
import type { AdminUser, FamilyProfile } from '../types/admin';

function roleLabel(role: string): string {
  if (role === 'app_user') return 'Primary User';
  if (role === 'content_editor') return 'Content Editor';
  if (role === 'support') return 'Support';
  if (role === 'analyst') return 'Analyst';
  return 'Admin';
}

function formatMemberSince(value: string | null | undefined): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString();
}

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

export function UsersPage() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [familyForUser, setFamilyForUser] = useState<AdminUser | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [pendingUserAction, setPendingUserAction] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const supportedLanguagesQuery = useQuery({ queryKey: ['supported-languages'], queryFn: fetchSupportedLanguages });

  const refreshUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const userMutation = useMutation({
    mutationFn: ({ userId, role, isActive }: { userId: number; role: string; isActive: boolean }) =>
      updateUser(userId, { role, is_active: isActive }),
    onSuccess: async () => {
      setToast({ type: 'ok', text: 'User updated' });
      setPendingUserAction(null);
      await refreshUsers();
    },
    onError: () => {
      setPendingUserAction(null);
      setToast({ type: 'err', text: 'Failed to update user' });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: async () => {
      setToast({ type: 'ok', text: 'User deleted' });
      setPendingUserAction(null);
      await refreshUsers();
    },
    onError: () => {
      setPendingUserAction(null);
      setToast({ type: 'err', text: 'Failed to delete user' });
    }
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: {
      email: string;
      full_name: string;
      role: string;
      is_active: boolean;
      country: string;
      language: string;
      temp_password: string;
    }) => createUser(payload),
    onSuccess: async () => {
      setToast({ type: 'ok', text: 'User created' });
      setPendingUserAction(null);
      setShowAddUserModal(false);
      await refreshUsers();
    },
    onError: () => {
      setPendingUserAction(null);
      setToast({ type: 'err', text: 'Failed to create user' });
    }
  });

  const primaryUsers = useMemo(() => usersQuery.data?.users.filter((u) => u.role === 'app_user') ?? [], [usersQuery.data]);
  const filteredUsers = useMemo(() => {
    const all = usersQuery.data?.users ?? [];
    return all.filter((u) => {
      const matchesSearch = filterSearch
        ? u.email.toLowerCase().includes(filterSearch.toLowerCase()) || u.full_name.toLowerCase().includes(filterSearch.toLowerCase())
        : true;
      const matchesRole = filterRole === 'all' ? true : u.role === filterRole;
      const matchesStatus =
        filterStatus === 'all'
          ? true
          : filterStatus === 'active'
            ? u.account_state === 'active'
            : filterStatus === 'invited'
              ? u.account_state === 'invited'
              : u.account_state === 'paused';
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersQuery.data, filterSearch, filterRole, filterStatus]);

  const bulkMutation = useMutation({
    mutationFn: (payload: {
      user_ids: number[];
      action: 'set_status' | 'set_role' | 'delete';
      is_active?: boolean;
      role?: string;
    }) => bulkUserAction(payload),
    onSuccess: async (data) => {
      setToast({ type: 'ok', text: `Bulk action completed. Affected: ${data.affected}` });
      setSelectedUserIds([]);
      await refreshUsers();
    },
    onError: () => setToast({ type: 'err', text: 'Bulk action failed' })
  });

  if (usersQuery.isLoading) return <p className="text-sm text-slate-500">Loading users...</p>;
  if (usersQuery.isError || !usersQuery.data) return <p className="text-sm text-red-600">Failed to load users.</p>;
  const supportedLanguages = supportedLanguagesQuery.data?.supported_languages?.length
    ? supportedLanguagesQuery.data.supported_languages
    : ['en'];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Users & Accounts</h2>
          <p className="mt-1 text-sm text-slate-500">Manage users, statuses, and family profiles under each primary account.</p>
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          Add / Invite User
        </button>
      </div>

      {toast ? (
        <div className={`rounded-lg border px-3 py-2 text-sm ${toast.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {toast.text}
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Search name or email..."
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="all">All Roles</option>
            <option value="admin">admin</option>
            <option value="content_editor">content_editor</option>
            <option value="support">support</option>
            <option value="analyst">analyst</option>
            <option value="app_user">app_user</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="paused">Paused</option>
          </select>
          <button
            onClick={() => {
              setFilterSearch('');
              setFilterRole('all');
              setFilterStatus('all');
            }}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            Reset Filters
          </button>
        </div>
      </section>

      {selectedUserIds.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-700">{selectedUserIds.length} selected</p>
            <button
              onClick={() => bulkMutation.mutate({ user_ids: selectedUserIds, action: 'set_status', is_active: true })}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            >
              Bulk Activate
            </button>
            <button
              onClick={() => bulkMutation.mutate({ user_ids: selectedUserIds, action: 'set_status', is_active: false })}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            >
              Bulk Pause
            </button>
            <button
              onClick={() => bulkMutation.mutate({ user_ids: selectedUserIds, action: 'set_role', role: 'app_user' })}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            >
              Set Role: app_user
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete ${selectedUserIds.length} selected users?`)) {
                  bulkMutation.mutate({ user_ids: selectedUserIds, action: 'delete' });
                }
              }}
              className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600"
            >
              Bulk Delete
            </button>
          </div>
        </section>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  checked={filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.includes(u.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUserIds(filteredUsers.map((u) => u.id));
                    } else {
                      setSelectedUserIds([]);
                    }
                  }}
                />
              </th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Full Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Account State</th>
              <th className="px-4 py-3 font-medium">Member Since</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds((prev) => Array.from(new Set([...prev, user.id])));
                      } else {
                        setSelectedUserIds((prev) => prev.filter((id) => id !== user.id));
                      }
                    }}
                  />
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">{user.email}</td>
                <td className="px-4 py-3 text-slate-600">{user.full_name || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{roleLabel(user.role)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {user.is_active ? 'Active' : 'Paused'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                    {user.account_state}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatMemberSince(user.member_since)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => navigate(`/users-accounts/${user.id}`)} className="rounded-md border border-slate-300 px-2 py-1 text-xs">View Profile</button>
                    <button
                      disabled={pendingUserAction === `status:${user.id}` || pendingUserAction === `delete:${user.id}`}
                      onClick={() => {
                        setPendingUserAction(`status:${user.id}`);
                        userMutation.mutate({ userId: user.id, role: user.role, isActive: !user.is_active });
                      }}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    >
                      {pendingUserAction === `status:${user.id}` ? 'Working...' : user.is_active ? 'Pause' : 'Activate'}
                    </button>
                    {user.role === 'app_user' ? (
                      <button onClick={() => setFamilyForUser(user)} className="rounded-md border border-indigo-300 px-2 py-1 text-xs text-indigo-700">Family</button>
                    ) : null}
                    <button
                      disabled={pendingUserAction === `delete:${user.id}` || pendingUserAction === `status:${user.id}`}
                      onClick={() => {
                        if (window.confirm(`Delete user ${user.email}?`)) {
                          setPendingUserAction(`delete:${user.id}`);
                          deleteUserMutation.mutate(user.id);
                        }
                      }}
                      className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600"
                    >
                      {pendingUserAction === `delete:${user.id}` ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddUserModal ? (
        <AddUserModal
          supportedLanguages={supportedLanguages}
          countries={COUNTRIES}
          working={pendingUserAction === 'create-user'}
          onClose={() => {
            if (pendingUserAction !== 'create-user') setShowAddUserModal(false);
          }}
          onSubmit={(payload) => {
            setPendingUserAction('create-user');
            createUserMutation.mutate(payload);
          }}
        />
      ) : null}

      {familyForUser ? (
        <FamilyModal
          primaryUser={familyForUser}
          onClose={() => setFamilyForUser(null)}
          onToast={setToast}
          primaryUsers={primaryUsers}
        />
      ) : null}
    </div>
  );
}

function AddUserModal({
  supportedLanguages,
  countries,
  working,
  onClose,
  onSubmit
}: {
  supportedLanguages: string[];
  countries: string[];
  working: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    country: string;
    language: string;
    temp_password: string;
  }) => void;
}) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('app_user');
  const [isActive, setIsActive] = useState(true);
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState(supportedLanguages[0] ?? 'en');
  const [tempPassword, setTempPassword] = useState('change-me');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <h4 className="text-lg font-semibold">Add / Invite User</h4>
        <p className="mt-1 text-sm text-slate-500">Create user account and capture profile details.</p>

        <form
          className="mt-4 grid grid-cols-1 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim()) return;
            onSubmit({
              email,
              full_name: fullName,
              role,
              is_active: isActive,
              country,
              language: language || 'en',
              temp_password: tempPassword || 'change-me'
            });
          }}
        >
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="admin">admin</option>
            <option value="content_editor">content_editor</option>
            <option value="support">support</option>
            <option value="analyst">analyst</option>
            <option value="app_user">app_user</option>
          </select>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <input type="password" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} placeholder="Temporary password" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
          <div className="mt-1 flex gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-3 py-2 text-sm" disabled={working}>Cancel</button>
            <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60" disabled={working}>
              {working ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FamilyModal({
  primaryUser,
  onClose,
  onToast
}: {
  primaryUser: AdminUser;
  onClose: () => void;
  onToast: (t: { type: 'ok' | 'err'; text: string }) => void;
  primaryUsers: AdminUser[];
}) {
  const queryClient = useQueryClient();
  const [viewConsent, setViewConsent] = useState<FamilyProfile | null>(null);
  const [editingChild, setEditingChild] = useState<FamilyProfile | null>(null);
  const [pendingProfileAction, setPendingProfileAction] = useState<string | null>(null);

  const [newType, setNewType] = useState<'child' | 'adult'>('child');
  const [newName, setNewName] = useState('');
  const [newAgeBand, setNewAgeBand] = useState('13_15');

  const profilesQuery = useQuery({
    queryKey: ['profiles', primaryUser.id],
    queryFn: () => fetchProfilesByPrimaryUser(primaryUser.id)
  });

  const refreshProfiles = async () => {
    await queryClient.invalidateQueries({ queryKey: ['profiles', primaryUser.id] });
  };

  const createProfileMutation = useMutation({
    mutationFn: () =>
      createProfileForPrimaryUser(primaryUser.id, {
        profile_type: newType,
        display_name: newName,
        age_band: newAgeBand,
        daily_time_limit_minutes: 60,
        topic_restrictions: [],
        conversation_visibility_rule: 'summary_only'
      }),
    onSuccess: async () => {
      onToast({ type: 'ok', text: `${newType} profile created` });
      setNewName('');
      setPendingProfileAction(null);
      await refreshProfiles();
    },
    onError: () => {
      setPendingProfileAction(null);
      onToast({ type: 'err', text: 'Failed to create profile' });
    }
  });

  const updateChildMutation = useMutation({
    mutationFn: ({ profileId, payload }: { profileId: number; payload: Parameters<typeof updateChildProfile>[1] }) =>
      updateChildProfile(profileId, payload),
    onSuccess: async () => {
      onToast({ type: 'ok', text: 'Child profile updated' });
      setPendingProfileAction(null);
      await refreshProfiles();
    },
    onError: () => {
      setPendingProfileAction(null);
      onToast({ type: 'err', text: 'Failed to update child profile' });
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ profileId, active }: { profileId: number; active: boolean }) => updateChildStatus(profileId, active),
    onSuccess: async () => {
      onToast({ type: 'ok', text: 'Child status updated' });
      setPendingProfileAction(null);
      await refreshProfiles();
    },
    onError: () => {
      setPendingProfileAction(null);
      onToast({ type: 'err', text: 'Failed to update child status' });
    }
  });

  const consentMutation = useMutation({
    mutationFn: ({ profileId, guardianUserId }: { profileId: number; guardianUserId: number }) =>
      recordChildConsent(profileId, guardianUserId, 'v1'),
    onSuccess: async () => {
      onToast({ type: 'ok', text: 'Consent recorded' });
      setPendingProfileAction(null);
      await refreshProfiles();
    },
    onError: () => {
      setPendingProfileAction(null);
      onToast({ type: 'err', text: 'Failed to record consent' });
    }
  });

  const deleteChildMutation = useMutation({
    mutationFn: (profileId: number) => deleteChildProfile(profileId),
    onSuccess: async () => {
      onToast({ type: 'ok', text: 'Child profile deleted' });
      setPendingProfileAction(null);
      await refreshProfiles();
    },
    onError: () => {
      setPendingProfileAction(null);
      onToast({ type: 'err', text: 'Failed to delete child profile' });
    }
  });

  const onAddProfile = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setPendingProfileAction('create');
    createProfileMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold">Family Profiles</h4>
            <p className="text-sm text-slate-500">Primary user: {primaryUser.email}</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Close</button>
        </div>

        <form onSubmit={onAddProfile} className="mb-4 grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-5">
          <select value={newType} onChange={(e) => setNewType(e.target.value as 'child' | 'adult')} className="rounded-md border px-2 py-1 text-sm">
            <option value="child">Child</option>
            <option value="adult">Adult</option>
          </select>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Profile name" className="rounded-md border px-2 py-1 text-sm" />
          <input value={newAgeBand} onChange={(e) => setNewAgeBand(e.target.value)} placeholder="Age band" className="rounded-md border px-2 py-1 text-sm" />
          <button disabled={pendingProfileAction === 'create'} type="submit" className="rounded-md bg-slate-900 px-3 py-1 text-sm text-white disabled:opacity-60">
            {pendingProfileAction === 'create' ? 'Adding...' : 'Add Profile'}
          </button>
        </form>

        {profilesQuery.isLoading ? <p className="text-sm text-slate-500">Loading profiles...</p> : null}
        {profilesQuery.data ? (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Age Band</th>
                <th className="px-3 py-2 font-medium">Consent</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profilesQuery.data.items.map((profile) => (
                <tr key={profile.profile_id}>
                  <td className="px-3 py-2">{profile.display_name}</td>
                  <td className="px-3 py-2">{profile.profile_type}</td>
                  <td className="px-3 py-2">{profile.age_band}</td>
                  <td className="px-3 py-2">{profile.profile_type === 'child' ? (profile.consent_granted ? 'Granted' : 'Pending') : 'N/A'}</td>
                  <td className="px-3 py-2">{profile.profile_active ? 'Active' : 'Inactive'}</td>
                  <td className="px-3 py-2">
                    {profile.profile_type === 'child' ? (
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setEditingChild(profile)} className="rounded-md border px-2 py-1 text-xs">Edit</button>
                        <button
                          disabled={pendingProfileAction === `consent-view:${profile.profile_id}`}
                          onClick={async () => {
                            setPendingProfileAction(`consent-view:${profile.profile_id}`);
                            try {
                              setViewConsent(await getChildConsent(profile.profile_id));
                            } finally {
                              setPendingProfileAction(null);
                            }
                          }}
                          className="rounded-md border px-2 py-1 text-xs"
                        >
                          {pendingProfileAction === `consent-view:${profile.profile_id}` ? 'Loading...' : 'Consent'}
                        </button>
                        <button
                          disabled={pendingProfileAction === `status:${profile.profile_id}`}
                          onClick={() => {
                            setPendingProfileAction(`status:${profile.profile_id}`);
                            statusMutation.mutate({ profileId: profile.profile_id, active: !profile.profile_active });
                          }}
                          className="rounded-md border px-2 py-1 text-xs"
                        >
                          {pendingProfileAction === `status:${profile.profile_id}` ? 'Working...' : profile.profile_active ? 'Deactivate' : 'Activate'}
                        </button>
                        {!profile.consent_granted ? (
                          <button
                            disabled={pendingProfileAction === `consent:${profile.profile_id}`}
                            onClick={() => {
                              setPendingProfileAction(`consent:${profile.profile_id}`);
                              consentMutation.mutate({ profileId: profile.profile_id, guardianUserId: primaryUser.id });
                            }}
                            className="rounded-md border border-emerald-300 px-2 py-1 text-xs text-emerald-700"
                          >
                            {pendingProfileAction === `consent:${profile.profile_id}` ? 'Recording...' : 'Record Consent'}
                          </button>
                        ) : null}
                        <button
                          disabled={pendingProfileAction === `delete:${profile.profile_id}`}
                          onClick={() => {
                            if (window.confirm(`Delete child profile ${profile.display_name}?`)) {
                              setPendingProfileAction(`delete:${profile.profile_id}`);
                              deleteChildMutation.mutate(profile.profile_id);
                            }
                          }}
                          className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600"
                        >
                          {pendingProfileAction === `delete:${profile.profile_id}` ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">No child-specific actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {editingChild ? (
          <EditChildModal
            child={editingChild}
            onClose={() => setEditingChild(null)}
            onSave={async (payload) => {
              await updateChildMutation.mutateAsync({ profileId: editingChild.profile_id, payload });
              setEditingChild(null);
            }}
          />
        ) : null}

        {viewConsent ? (
          <InfoModal
            title="Consent Details"
            lines={[
              `Profile: ${viewConsent.display_name}`,
              `Consent: ${viewConsent.consent_granted ? 'Granted' : 'Pending'}`,
              `Consent Version: ${viewConsent.consent_text_version ?? 'n/a'}`,
              `Visibility Rule: ${viewConsent.conversation_visibility_rule ?? 'n/a'}`,
              `Topic Restrictions: ${viewConsent.topic_restrictions.join(', ') || 'None'}`
            ]}
            onClose={() => setViewConsent(null)}
          />
        ) : null}
      </div>
    </div>
  );
}

function InfoModal({ title, lines, onClose }: { title: string; lines: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <h4 className="text-lg font-semibold">{title}</h4>
        <div className="mt-3 space-y-1 text-sm text-slate-700">{lines.map((line) => <p key={line}>{line}</p>)}</div>
        <button onClick={onClose} className="mt-4 rounded-md border border-slate-300 px-3 py-1 text-sm">Close</button>
      </div>
    </div>
  );
}

function EditChildModal({
  child,
  onClose,
  onSave
}: {
  child: FamilyProfile;
  onClose: () => void;
  onSave: (payload: {
    display_name: string;
    age_band: string;
    daily_time_limit_minutes: number;
    topic_restrictions: string[];
    conversation_visibility_rule: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState(child.display_name);
  const [ageBand, setAgeBand] = useState(child.age_band);
  const [limit, setLimit] = useState(child.daily_time_limit_minutes ?? 60);
  const [topics, setTopics] = useState(child.topic_restrictions.join(','));
  const [visibility, setVisibility] = useState(child.conversation_visibility_rule ?? 'summary_only');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <h4 className="text-lg font-semibold">Edit Child Profile</h4>
        <div className="mt-4 grid grid-cols-1 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
          <input value={ageBand} onChange={(e) => setAgeBand(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
          <input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="rounded-lg border px-3 py-2 text-sm" />
          <input value={topics} onChange={(e) => setTopics(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" placeholder="topic1,topic2" />
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            <option value="summary_only">summary_only</option>
            <option value="titles_only">titles_only</option>
            <option value="none">none</option>
          </select>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Cancel</button>
          <button
            onClick={() =>
              onSave({
                display_name: name,
                age_band: ageBand,
                daily_time_limit_minutes: limit,
                topic_restrictions: topics.split(',').map((t) => t.trim()).filter(Boolean),
                conversation_visibility_rule: visibility
              })
            }
            className="rounded-md bg-slate-900 px-3 py-1 text-sm text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
