import { NavLink, Outlet, Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
const links = [
  ['/admin', 'Dashboard'],
  ['/admin/users', 'Users'],
  ['/admin/verification', 'Verification'],
  ['/admin/communities', 'Communities'],
  ['/admin/reports', 'Reports'],
  ['/admin/institutions', 'Institutions'],
  ['/admin/announcements', 'Announcements'],
  ['/admin/system', 'System'],
];
export default function AdminLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-4 border-b border-line bg-surface p-5">
        <Link to="/" aria-label="Conxee home">
          <Logo />
        </Link>
        <span className="text-caption text-muted">Administration</span>
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <nav
          aria-label="Administration"
          className="flex gap-2 overflow-auto border-b border-line p-3 md:w-56 md:flex-col md:border-r"
        >
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex min-h-11 shrink-0 items-center rounded-lg px-3 text-caption ${isActive ? 'bg-hover font-semibold' : 'text-muted hover:bg-hover'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <main id="main-content" className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
