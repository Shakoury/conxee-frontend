import { useEffect, useState, type FormEvent } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { SignupWizard } from './signup';
import { PasswordInput } from './password-input';
import { api, ApiError, UserFacingError } from './api';
import {
  Button,
  Logo,
  Footer,
  ActionError,
  useAction,
  Heading,
} from './common';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import './auth.css';
export function AuthPage({ signup = false }: { signup?: boolean }) {
  const { reload } = useAuth();
  const navigate = useNavigate(),
    location = useLocation(),
    action = useAction();
  const [waiting, setWaiting] = useState(false);
  useEffect(() => {
    setWaiting(false);
    if (!action.busy) return;
    const timer = window.setTimeout(() => setWaiting(true), 8000);
    return () => window.clearTimeout(timer);
  }, [action.busy]);
  useEffect(() => {
    if (action.error)
      document
        .querySelector('.auth-form-wrap .form-error')
        ?.scrollIntoView({ block: 'nearest' });
  }, [action.error]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const result = await action.run(async () => {
      try {
        return await api('/auth/login', 'POST', {
          email: String(data.get('email')).trim(),
          password: data.get('password'),
        });
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.code === 'EMAIL_VERIFICATION_REQUIRED'
        ) {
          navigate('/verify-email', {
            state: {
              email: String(data.get('email')).trim(),
              verificationRequired: true,
            },
          });
          return null;
        }
        throw error;
      }
    });
    if (!result) return;
    const profile = await reload();
    if (!profile) {
      await action.run(async () => {
        throw new UserFacingError(
          'We could not finish signing you in. Please try again. If the problem continues, contact support.',
        );
      });
      return;
    }
    const returnTo = location.state?.returnTo;
    navigate(
      typeof returnTo === 'string' &&
        returnTo.startsWith('/') &&
        !returnTo.startsWith('//')
        ? returnTo
        : '/',
    );
  }
  return (
    <>
      <div className="auth-page">
        <div className="auth-story">
          <img
            className="auth-brand-background"
            src="/images/bukcz-background.webp"
            alt=""
            aria-hidden="true"
            width="512"
            height="512"
          />
          <Logo />
          <span className="eyebrow">BUILT FOR NIGERIAN CAMPUS COMMUNITIES</span>
          <h1>
            Your campus,
            <br />
            connected<span>.</span>
          </h1>
          <p>
            Connect with students, find your community and share campus life.
          </p>
          <div className="auth-community-tags">
            <span>Campus conversations</span>
            <span>Student communities</span>
            <span>Shared opportunities</span>
          </div>
        </div>
        <div className="auth-form-wrap">
          <div className="auth-box">
            <img
              className="auth-brand-mark"
              src="/images/bukcz-mark.webp"
              alt="CONXEE"
              width="64"
              height="64"
            />
            <h2>Welcome to CONXEE.</h2>
            {location.state?.reason === 'admin-required' && (
              <p role="alert">
                Administration uses a separately protected sign-in.
              </p>
            )}
            {location.state?.message && (
              <p role="status">{location.state.message}</p>
            )}
            <p>Your campus, connected.</p>
            <Tabs
              defaultValue={signup ? 'signup' : 'login'}
              onValueChange={action.clear}
            >
              <TabsList className="auth-tabs">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Signup</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={(e) => void submit(e)}>
                  <label>
                    Email
                    <Input
                      name="email"
                      type="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      autoComplete="username"
                      required
                      maxLength={254}
                    />
                  </label>
                  <label>
                    Password
                    <PasswordInput
                      name="password"
                      aria-label="Password"
                      autoComplete="current-password"
                      required
                      maxLength={72}
                    />
                  </label>
                  <Link to="/forgot-password">Forgot password?</Link>
                  {waiting && action.busy && (
                    <p role="status">
                      Still waiting for a response. Please keep this page open;
                      we will show the result or a connection error.
                    </p>
                  )}
                  <ActionError error={action.error} />
                  <Button disabled={action.busy} className="auth-submit">
                    {action.busy ? 'Signing in…' : 'Log in'}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <SignupWizard />
              </TabsContent>
            </Tabs>
            <p className="auth-terms">
              By using CONXEE, you agree to our <Link to="/terms">Terms</Link>{' '}
              and <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
export function PasswordPage({ reset = false }: { reset?: boolean }) {
  const [params] = useSearchParams(),
    navigate = useNavigate(),
    action = useAction(),
    [sent, setSent] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (reset && data.get('password') !== data.get('confirm')) {
      await action.run(async () => {
        throw new UserFacingError('Passwords do not match.');
      });
      return;
    }
    const result = await action.run(async () => {
      const response = await api(
        reset ? '/auth/reset-password' : '/auth/forgot-password',
        'POST',
        reset
          ? { token: params.get('token') ?? '', password: data.get('password') }
          : { email: data.get('email') },
      );
      const expected = reset
        ? 'Password reset. Sign in again'
        : 'Check your email for a reset link';
      if (response?.message !== expected)
        throw new UserFacingError(
          'The server did not confirm this request. Please try again.',
        );
      return response;
    });
    if (result) {
      if (reset)
        navigate('/auth', {
          replace: true,
          state: {
            message:
              'Password updated. Sign in with your email and new password.',
          },
        });
      else setSent(true);
    }
  }
  return (
    <>
      <section className="production-public">
        <Logo />
        <Heading
          title={reset ? 'Reset your password' : 'Forgot your password?'}
          description={
            reset
              ? 'Choose a new password.'
              : 'Enter the email used for your account.'
          }
        />
        {reset && !params.get('token') ? (
          <p role="alert">
            Open the reset link from your email.{' '}
            <Link to="/forgot-password">Request a new link</Link>.
          </p>
        ) : sent ? (
          <p role="status">Check your email for a reset link</p>
        ) : (
          <form onSubmit={(e) => void submit(e)}>
            {reset ? (
              <>
                <label>
                  New password
                  <PasswordInput
                    name="password"
                    aria-label="Password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={72}
                  />
                </label>
                <label>
                  Confirm new password
                  <PasswordInput
                    name="confirm"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={72}
                  />
                </label>
              </>
            ) : (
              <label>
                Email address
                <Input
                  name="email"
                  type="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="email"
                  required
                />
              </label>
            )}
            <ActionError error={action.error} />
            <Button disabled={action.busy}>
              {reset ? 'Reset password' : 'Send reset link'}
            </Button>
          </form>
        )}
        <Link to="/auth">Back to login</Link>
      </section>
      <Footer />
    </>
  );
}
export function VerificationPage() {
  const [params] = useSearchParams(),
    navigate = useNavigate(),
    action = useAction(),
    location = useLocation();
  const token = params.get('token');
  const [resent, setResent] = useState(false);
  const [email, setEmail] = useState(location.state?.email ?? '');
  useEffect(() => {
    if (!token) return;
    let active = true;
    void api('/auth/verification-details', 'POST', { token })
      .then((data) => {
        if (active) setEmail(data.email);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [token]);
  return (
    <>
      <section className="production-public production-verification">
        <Logo />
        <Heading
          title={token ? 'Verify your email' : 'Check your email'}
          description={
            token
              ? 'Confirm your email address to activate your account.'
              : 'Verify your email before signing in. Check your inbox and spam folder for your verification link.'
          }
        />
        {location.state?.catalogueStatus === 'pending_review' && (
          <p role="status">
            Your missing academic details have been submitted for catalogue
            review. Catalogue approval does not establish student eligibility.
          </p>
        )}
        {location.state?.registrationAccountType === 'student' && (
          <p>
            Student eligibility remains unverified until an independent
            eligibility approval. Email confirmation does not grant a
            verified-student badge.
          </p>
        )}
        <div className="production-public-actions">
          {!token && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void action.run(async () => {
                  await api('/auth/resend-verification', 'POST', {
                    email,
                  });
                  setResent(true);
                });
              }}
            >
              <p className="verification-address">
                {email ||
                  'Return to login to request verification for your account.'}
              </p>
              <Button disabled={action.busy || !email}>
                {action.busy ? 'Requesting link…' : 'Resend verification email'}
              </Button>
              {resent && (
                <p role="status">
                  If your account needs verification, a link will be sent. Check
                  your inbox and spam folder. Allow a minute before requesting
                  another.
                </p>
              )}
            </form>
          )}
          {token && email && <p className="verification-address">{email}</p>}
          {token && (
            <Button
              disabled={action.busy}
              onClick={() =>
                void action.run(async () => {
                  const response = await api('/auth/verify-email', 'POST', {
                    token,
                  });
                  if (response?.message !== 'Email verified')
                    throw new UserFacingError(
                      'The server did not confirm verification. Please try again.',
                    );
                  navigate('/auth', {
                    replace: true,
                    state: {
                      message: 'Email verified. You can now log in.',
                      returnTo: '/',
                    },
                  });
                }, 'Email verified.')
              }
            >
              {action.busy ? 'Verifying…' : 'Verify email'}
            </Button>
          )}
          <ActionError error={action.error} />
          <Link to="/auth">Back to login</Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
