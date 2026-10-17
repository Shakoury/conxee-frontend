import { useRef, useState, forwardRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Button as SharedButton,
  type ButtonProps,
} from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { displayError } from './api';
export const Button = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant'> & {
    variant?: ButtonProps['variant'] | 'outline';
  }
>(({ variant, type = 'submit', className = '', ...props }, ref) => (
  <SharedButton
    {...props}
    ref={ref}
    type={type}
    variant={variant === 'outline' ? 'secondary' : variant}
    className={`btn ${className}`}
  />
));
Button.displayName = 'BukczAuthButton';
export function Logo() {
  return (
    <Link to="/landing" className="logo" aria-label="Conxee home">
      <img src="/images/bukcz-mark.webp" alt="" width="32" height="32" />
      CONXEE.
    </Link>
  );
}
export function Heading({
  title,
  description,
}: {
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="production-heading">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
export function Footer() {
  return (
    <footer className="public-footer">
      <nav aria-label="Public pages">
        {[
          ['about', 'About'],
          ['privacy', 'Privacy Policy'],
          ['terms', 'Terms of Use'],
          ['help', 'Help'],
        ].map(([url, label]) => (
          <Link key={url} to={'/' + url}>
            {label}
          </Link>
        ))}
      </nav>
      <p>CONXEE © 2026 · Your campus, connected.</p>
    </footer>
  );
}
export function useAction() {
  const toast = useToast();
  const running = useRef(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function run<T>(
    task: () => Promise<T>,
    success?: string,
  ): Promise<T | undefined> {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await task();
      if (success) toast({ title: success, variant: 'success' });
      return result;
    } catch (cause) {
      setError(displayError(cause));
      return undefined;
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return { run, busy, error, clear: () => setError('') };
}
export function ActionError({ error }: { error: string }) {
  return error ? (
    <p className="form-error" role="alert">
      {error}
    </p>
  ) : null;
}
