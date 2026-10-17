import { Outlet, Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
export default function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="p-6">
        <Link to="/landing" aria-label="Conxee landing">
          <Logo />
        </Link>
      </header>
      <main id="main-content" className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
