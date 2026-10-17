import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError('');
    try {
      await login({
        email: String(data.get('email') ?? '').trim(),
        password: String(data.get('password') ?? ''),
      });
      // Only permit local destinations. Never redirect to a supplied external URL.
      const from = location.state?.from;
      const destination =
        typeof from === 'string' &&
        from.startsWith('/') &&
        !from.startsWith('//') &&
        !from.startsWith('/\\') &&
        !from.startsWith('/admin')
          ? from
          : '/';
      navigate(destination, { replace: true });
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.status === 401
          ? 'Unable to sign in. Check your credentials and email verification.'
          : 'Sign-in is unavailable. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12">
      <h1 className="text-h1">Login</h1>
      <p className="mt-2 text-caption text-muted">Sign in to your CONXEE account.</p>
      {location.state?.reason === 'admin-required' && (
        <p role="alert" className="mt-4 rounded-lg border border-line bg-hover p-3 text-caption">
          Administration uses a separately protected sign-in.
        </p>
      )}
      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-caption font-medium">Email</label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            disabled={pending}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-2 block text-caption font-medium">Password</label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
          />
        </div>
        {error && <p role="alert" className="text-caption text-danger">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <div className="mt-6 flex justify-between gap-3 text-caption">
        <Link to="/forgot-password" className="underline">Forgot password?</Link>
        <Link to="/register" className="underline">Create an account</Link>
      </div>
    </section>
  );
}
