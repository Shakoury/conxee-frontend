import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { AuthFrame } from '@/components/auth/AuthFrame';
import {
  FormField,
  SubmitButton,
  FormError,
  fieldA11y,
} from '@/components/auth/FormFields';
import { Input } from '@/components/ui/input';
import { forgotSchema } from '@/lib/auth-schemas';
import { api } from '@/lib/api';
import { authError } from '@/lib/auth-errors';
export default function ForgotPassword() {
  const [sent, setSent] = useState(false),
    [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });
  async function submit(values: { email: string }) {
    setError('');
    try {
      await api('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setSent(true);
    } catch (cause) {
      setError(authError(cause));
    }
  }
  return (
    <AuthFrame
      title={sent ? 'Check your email' : 'Forgot password?'}
      description={
        sent
          ? 'If an account exists for that email, we’ve sent a password reset link.'
          : 'No worries. We’ll help you get back in.'
      }
      back="/login"
      footer={
        <Link
          to="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Back to login
        </Link>
      }
    >
      {sent ? (
        <div
          role="status"
          className="flex flex-col items-center gap-4 py-4 text-center"
        >
          <MailCheck className="size-10" />
          <p className="text-caption text-muted">
            Check your inbox and spam folder. Follow the link to choose a new
            password.
          </p>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit(submit)} className="space-y-6">
          <FormField id="email" label="Email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              {...register('email')}
              {...fieldA11y('email', errors.email?.message)}
            />
          </FormField>
          <FormError message={error} />
          <SubmitButton pending={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </SubmitButton>
        </form>
      )}
    </AuthFrame>
  );
}
