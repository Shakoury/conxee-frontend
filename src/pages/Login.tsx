import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthFrame } from '@/components/auth/AuthFrame';
import {
  FormField,
  PasswordInput,
  SubmitButton,
  FormError,
  fieldA11y,
} from '@/components/auth/FormFields';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useRegistration } from '@/contexts/RegistrationContext';
import { loginSchema } from '@/lib/auth-schemas';
import { ApiError } from '@/lib/api';
import { authError } from '@/lib/auth-errors';
export default function Login() {
  const { login } = useAuth();
  const { reset } = useRegistration();
  useEffect(() => reset(), [reset]);
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  async function submit(values: { email: string; password: string }) {
    setError('');
    try {
      await login(values);
      reset();
      navigate('/', { replace: true });
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.status === 401
          ? 'Unable to sign in. Check your credentials and email verification.'
          : authError(cause),
      );
    }
  }
  return (
    <AuthFrame
      title="Login"
      description="Welcome back. Your campus is waiting."
      footer={
        <>
          New to Conxee?{' '}
          <Link
            to="/register"
            className="font-semibold text-foreground underline underline-offset-4"
          >
            Create an account
          </Link>
        </>
      }
    >
      {location.state?.registered && (
        <p role="status" className="mb-5 rounded-lg bg-hover p-3 text-caption">
          Your account is ready. Log in to get started.
        </p>
      )}
      {location.state?.reason === 'admin-required' && (
        <p role="alert" className="mb-5 text-caption text-muted">
          Administration uses a separately protected sign-in.
        </p>
      )}
      <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@university.edu.ng"
            disabled={isSubmitting}
            {...register('email')}
            {...fieldA11y('email', errors.email?.message)}
          />
        </FormField>
        <FormField
          id="password"
          label="Password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            disabled={isSubmitting}
            {...register('password')}
            {...fieldA11y('password', errors.password?.message)}
          />
        </FormField>
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="inline-flex min-h-11 items-center text-caption font-medium underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
        <FormError message={error} />
        <SubmitButton pending={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </SubmitButton>
      </form>
    </AuthFrame>
  );
}
