import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { ArrowLeft, Check, LockKeyhole } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { useRegistration } from '@/contexts/RegistrationContext';
const steps = [
  'Institution',
  'Your course',
  'Account details',
  'Verify email',
  'Student ID',
];
export function AuthFrame({
  title,
  description,
  children,
  footer,
  step,
  back,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  step?: number;
  back?: string;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const location = useLocation();
  useEffect(() => {
    heading.current?.focus();
    document.title = `${title} · Conxee`;
  }, [title, location.pathname]);
  return (
    <section className="auth-enter mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center px-5 py-8 sm:px-8 sm:py-12">
      <div className="mb-8 flex justify-center">
        <Link to="/landing" aria-label="Conxee landing">
          <Logo />
        </Link>
      </div>
      {step && (
        <div className="mb-8">
          <div className="mb-3 flex justify-between text-label">
            <span>Step {step} of 5</span>
            <span className="text-muted">{steps[step - 1]}</span>
          </div>
          <ol aria-label="Registration progress" className="flex gap-2">
            {steps.map((name, index) => (
              <li
                key={name}
                aria-current={step === index + 1 ? 'step' : undefined}
                aria-label={`${name}${index + 1 < step ? ', completed' : ''}`}
                className="flex-1"
              >
                <span
                  className={`block h-1 rounded-full ${index < step ? 'bg-solid' : 'bg-line'}`}
                />
                <span className="sr-only">
                  {index + 1 < step && <Check />}
                  {name}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="rounded-2xl border border-line bg-surface px-5 py-8 shadow-[0_8px_40px_-24px_rgba(15,23,42,0.2)] sm:px-8">
        {back && (
          <Link
            to={back}
            className="mb-6 inline-flex min-h-11 items-center gap-2 text-caption text-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        )}
        <h1 ref={heading} tabIndex={-1} className="text-h2 outline-none">
          {title}
        </h1>
        <p className="mt-2 text-caption text-muted">{description}</p>
        <div className="mt-8">{children}</div>
      </div>
      {footer && (
        <div className="mt-6 text-center text-caption text-muted">{footer}</div>
      )}
      <p className="mt-8 flex items-center justify-center gap-2 text-label text-muted">
        <LockKeyhole className="size-3.5" />
        Your campus. Your community.
      </p>
    </section>
  );
}
export function RegistrationGate({
  step,
  children,
}: {
  step: number;
  children: ReactNode;
}) {
  const { data } = useRegistration();
  if (step > 1 && !data.institution_id)
    return <Navigate to="/register" replace />;
  if (step > 2 && (!data.faculty || !data.department))
    return <Navigate to="/register/faculty" replace />;
  if (step > 3 && (!data.email || !data.password))
    return <Navigate to="/register/details" replace />;
  if (step > 4 && !data.emailVerified)
    return <Navigate to="/register/verify" replace />;
  return children;
}
export const RegistrationFooter = () => (
  <span>
    Already have an account?{' '}
    <Link
      to="/login"
      className="font-semibold text-foreground underline underline-offset-4"
    >
      Log in
    </Link>
  </span>
);
