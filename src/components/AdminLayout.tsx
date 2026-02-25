import { NavLink, Outlet } from 'react-router-dom';

function DotIcon() {
  return <span className="h-2 w-2 rounded-full bg-current" />;
}

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/users-accounts', label: 'Users & Accounts' },
  { to: '/content-library', label: 'Content Library' },
  { to: '/ai-experience', label: 'AI Experience' },
  { to: '/safety-boundaries', label: 'Safety & Boundaries' },
  { to: '/engagement', label: 'Engagement' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/support', label: 'Support' },
  { to: '/billing', label: 'Billing' },
  { to: '/localization', label: 'Localization' },
  { to: '/settings', label: 'Settings' },
  { to: '/audit-logs', label: 'Audit Logs' }
];

export function AdminLayout() {
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-200 bg-white">
          <div className="px-6 py-5">
            <h1 className="text-xl font-semibold tracking-tight">ReframeQ Admin</h1>
            <p className="mt-1 text-sm text-slate-500">CBT self-help and wellness operations</p>
          </div>
          <nav className="px-3 py-2 space-y-1">
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

              <details className="relative ml-4">
                <summary className="list-none cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Admin Menu
                </summary>
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                  <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100">Profile</button>
                  <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100">Preferences</button>
                  <button className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Logout</button>
                </div>
              </details>
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
