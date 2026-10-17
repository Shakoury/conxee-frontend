import { Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
export default function PublicLayout() {
  const { pathname } = useLocation();
  const auth =
    pathname.startsWith('/register') ||
    ['/landing', '/login', '/forgot-password', '/reset-password'].includes(
      pathname,
    );
  return (
    <div className="flex min-h-dvh flex-col">
      {!auth && (
        <header className="p-6">
          <Link to="/landing" aria-label="Conxee landing">
            <Logo />
          </Link>
        </header>
      )}
      <main id="main-content" className="flex flex-1 flex-col">
        <Outlet />
      </main>
      {auth && (
        <footer className="flex justify-center gap-6 px-5 pb-6 text-label text-muted">
          <Link
            to="/privacy"
            className="inline-flex min-h-11 items-center hover:underline"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="inline-flex min-h-11 items-center hover:underline"
          >
            Terms
          </Link>
          <Link
            to="/help"
            className="inline-flex min-h-11 items-center hover:underline"
          >
            Help
          </Link>
        </footer>
      )}
    </div>
  );
}
