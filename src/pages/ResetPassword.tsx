import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { AuthFrame } from '@/components/auth/AuthFrame';
import {
  FormField,
  PasswordInput,
  SubmitButton,
  FormError,
  fieldA11y,
} from '@/components/auth/FormFields';
import { Button } from '@/components/ui/button';
import { resetSchema } from '@/lib/auth-schemas';
import { api } from '@/lib/api';
import { authError } from '@/lib/auth-errors';
export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token')?.trim();
  const [done, setDone] = useState(false),
    [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirm_password: '' },
  });
  async function submit(values: {
    password: string;
    confirm_password: string;
  }) {
    if (!token) return;
    setError('');
    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password: values.password }),
      });
      setDone(true);
    } catch (cause) {
      setError(authError(cause));
    }
  }
  return (
    <AuthFrame
      title={done ? 'Password updated' : 'Choose a new password'}
      description={
        done
          ? 'You’re all set. Use your new password to log in.'
          : 'Make it unique and keep it somewhere safe.'
      }
      footer={
        <Link
          to="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Back to login
        </Link>
      }
    >
      {!token ? (
        <div role="alert" className="space-y-5">
          <p className="text-caption text-muted">
            This reset link is missing its token. Request a new link to
            continue.
          </p>
          <Button asChild className="w-full">
            <Link to="/forgot-password">Request a new link</Link>
          </Button>
        </div>
      ) : done ? (
        <div role="status" className="space-y-6 text-center">
          <CheckCircle className="mx-auto size-10" />
          <Button asChild className="w-full">
            <Link to="/login">Log in</Link>
          </Button>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit(submit)} className="space-y-6">
          <FormField
            id="new-password"
            label="New password"
            error={errors.password?.message}
            hint="Use at least 8 characters."
          >
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              disabled={isSubmitting}
              {...register('password')}
              {...fieldA11y('new-password', errors.password?.message, true)}
            />
          </FormField>
          <FormField
            id="confirm-password"
            label="Confirm password"
            error={errors.confirm_password?.message}
          >
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              disabled={isSubmitting}
              {...register('confirm_password')}
              {...fieldA11y(
                'confirm-password',
                errors.confirm_password?.message,
              )}
            />
          </FormField>
          <FormError message={error} />
          <SubmitButton pending={isSubmitting}>
            {isSubmitting ? 'Updating…' : 'Reset password'}
          </SubmitButton>
        </form>
      )}
    </AuthFrame>
  );
}
