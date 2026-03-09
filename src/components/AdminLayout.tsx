import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';

function DotIcon() {
  return <span className="h-2 w-2 rounded-full bg-current" />;
}

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/users-accounts', label: 'Users & Accounts' },
  { to: '/language-settings', label: 'Language Settings' },
  { to: '/content-library', label: 'Content Library' },
  { to: '/prompts-configuration', label: 'Prompts Configuration' },
  { to: '/model-configuration', label: 'Model Configuration' },
  { to: '/onboarding-text-configuration', label: 'Onboarding Text' },
  { to: '/onboarding-policy-configuration', label: 'Onboarding Policy' },
  { to: '/ai-experience', label: 'AI Preview' },
  { to: '/safety-boundaries', label: 'Safety & Boundaries' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/audit-logs', label: 'Audit Logs' }
];

function roleLabel(role: string): string {
  if (role === 'content_editor') return 'Content Editor';
  if (role === 'support') return 'Support';
  if (role === 'analyst') return 'Analyst';
  if (role === 'app_user') return 'App User';
  return 'Admin';
}

function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function AdminLayout() {
  const { logout, role, fullName } = useAuth();
  const navigate = useNavigate();
  const displayName = fullName?.trim() ? fullName.trim() : roleLabel(role);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-200 bg-white">
          <div className="px-6 py-5">
            <h1 className="text-xl font-semibold tracking-tight">ReframeQ Admin</h1>
            <p className="mt-1 text-sm text-slate-500">CBT self-help and wellness operations</p>
          </div>
          <nav className="space-y-1 px-3 py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <DotIcon />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="w-full max-w-md">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search users, journeys, exercises, prompts..."
                    className="w-full border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="ml-4 flex items-center gap-2">
                <details className="relative">
                  <summary className="list-none cursor-pointer rounded-xl border border-slate-200 bg-white px-2 py-1.5 hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {initialsFromName(displayName)}
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-medium text-slate-700">{displayName}</p>
                        <p className="text-xs text-slate-400">{roleLabel(role)}</p>
                      </div>
                    </div>
                  </summary>
                  <div className="absolute right-0 mt-2 w-52 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                    <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100">Profile</button>
                    <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100">Preferences</button>
                    <div className="my-1 border-t border-slate-100" />
                    <p className="px-3 py-1 text-xs text-slate-400">Current role: {roleLabel(role)}</p>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </details>
              </div>
            </div>
          </header>

          <section className="p-6">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}
