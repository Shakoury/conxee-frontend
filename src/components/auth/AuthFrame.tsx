import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { ArrowLeft, Check, LockKeyhole } from 'lucide-react';
import '@/styles/auth-design.css';
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
    <div className="conxee-auth-design">
      <aside className="auth-story" aria-label="Welcome to Conxee">
        <img
          className="auth-story-background"
          src="/images/bukcz-background.webp"
          alt=""
          aria-hidden="true"
        />
        <Link to="/landing" className="auth-wordmark">
          <img src="/images/bukcz-mark.webp" width="32" height="32" alt="" />
          CONXEE.
        </Link>
        <span className="auth-eyebrow">
          BUILT FOR NIGERIAN CAMPUS COMMUNITIES
        </span>
        <h2>
          Your campus,
          <br />
          connected.
        </h2>
        <p>Connect with students, find your community and share campus life.</p>
        <div className="auth-tags">
          <span>Campus conversations</span>
          <span>Student communities</span>
          <span>Shared opportunities</span>
        </div>
      </aside>
      <section className="auth-form-wrap auth-enter">
        <div className="auth-box">
          <Link
            to="/landing"
            aria-label="Conxee landing"
            className="auth-brand"
          >
            <img
              src="/images/bukcz-mark.webp"
              width="56"
              height="56"
              alt="Conxee"
            />
          </Link>
          {step && (
            <div className="auth-progress-wrap">
              <div className="mb-4 flex justify-between text-label">
                <span>Step {step} of 5</span>
                <span className="text-muted">{steps[step - 1]}</span>
              </div>
              <ol aria-label="Registration progress" className="auth-progress">
                {steps.map((name, index) => (
                  <li
                    key={name}
                    aria-current={step === index + 1 ? 'step' : undefined}
                    aria-label={`${name}${index + 1 < step ? ', completed' : ''}`}
                    className={index < step ? 'completed' : ''}
                  >
                    <span aria-hidden="true">
                      {index + 1 < step ? (
                        <Check className="size-4" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="sr-only">{name}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
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
          {footer && (
            <div className="mt-6 text-center text-caption text-muted">
              {footer}
            </div>
          )}
          <p className="mt-8 flex items-center justify-center gap-2 text-label text-muted">
            <LockKeyhole className="size-3.5" />
            Your campus. Your community.
          </p>
        </div>
      </section>
    </div>
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
