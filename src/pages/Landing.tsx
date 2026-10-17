import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
export default function Landing() {
  useEffect(() => {
    document.title = 'Conxee · Your campus community';
  }, []);
  return (
    <section className="auth-enter mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-10 scale-125">
        <Logo />
      </div>
      <span className="mb-5 rounded-full border border-outline px-3 py-1 text-label text-muted">
        Made for your campus
      </span>
      <h1 className="max-w-lg text-h1 sm:text-[44px] sm:leading-tight">
        The campus platform for Nigerian students
      </h1>
      <p className="mt-5 max-w-sm text-body text-muted">
        Find your people. Share what matters. Make campus feel a little more
        connected.
      </p>
      <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
        <Button asChild variant="secondary" className="flex-1">
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link to="/register">
            Get Started
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <p className="mt-12 text-caption text-muted">
        One community. Endless possibilities.
      </p>
    </section>
  );
}
