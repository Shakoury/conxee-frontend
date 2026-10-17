import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  AuthFrame,
  RegistrationGate,
  RegistrationFooter,
} from '@/components/auth/AuthFrame';
import {
  FormField,
  SubmitButton,
  FormError,
  fieldA11y,
} from '@/components/auth/FormFields';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRegistration } from '@/contexts/RegistrationContext';
import { otpSchema } from '@/lib/auth-schemas';
import { api, ApiError } from '@/lib/api';
import { authError } from '@/lib/auth-errors';
function VerifyForm() {
  const { data, update } = useRegistration();
  const navigate = useNavigate();
  const [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [sending, setSending] = useState(false),
    [now, setNow] = useState(Date.now());
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const remaining = Math.max(0, Math.ceil((data.resendAt - now) / 1000));
  async function submit({ code }: { code: string }) {
    setError('');
    try {
      await api('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: data.email, code }),
      });
      update({ emailVerified: true });
      navigate('/register/student-id');
    } catch (cause) {
      if (cause instanceof ApiError && [400, 401, 422].includes(cause.status))
        setFieldError('code', {
          message:
            'That code is invalid or expired. Try again or request a new one.',
        });
      else setError(authError(cause));
    }
  }
  async function resend() {
    if (sending || remaining) return;
    setSending(true);
    setError('');
    setNotice('');
    try {
      await api('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: data.email }),
      });
      update({ codeSent: true, resendAt: Date.now() + 60000 });
      setNow(Date.now());
      setValue('code', '');
      clearErrors('code');
      setNotice('A new code is on its way. Check your inbox and spam folder.');
    } catch (cause) {
      setError(authError(cause));
    } finally {
      setSending(false);
    }
  }
  return (
    <AuthFrame
      step={4}
      back="/register/details"
      title="Check your inbox"
      description="We sent a code to your email"
      footer={<RegistrationFooter />}
    >
      <p className="mb-6 break-all text-caption font-medium">{data.email}</p>
      <form noValidate onSubmit={handleSubmit(submit)} className="space-y-6">
        <FormField
          id="code"
          label="Verification code"
          error={errors.code?.message}
          hint="Enter the 6-digit code. You can paste it from your email."
        >
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className="text-center text-h2 tracking-[0.4em]"
            disabled={isSubmitting || sending}
            {...register('code')}
            {...fieldA11y('code', errors.code?.message, true)}
          />
        </FormField>
        <FormError message={error} />
        {notice && (
          <p role="status" className="text-caption text-muted">
            {notice}
          </p>
        )}
        <SubmitButton pending={isSubmitting} disabled={sending}>
          {isSubmitting ? 'Verifying…' : 'Verify email'}
        </SubmitButton>
        <div className="text-center">
          <p className="text-caption text-muted">Didn’t get a code?</p>
          <Button
            variant="ghost"
            onClick={() => void resend()}
            disabled={sending || isSubmitting || remaining > 0}
          >
            {sending
              ? 'Sending…'
              : remaining > 0
                ? `Resend code in ${remaining}s`
                : 'Resend code'}
          </Button>
        </div>
      </form>
    </AuthFrame>
  );
}
export default function RegisterVerify() {
  return (
    <RegistrationGate step={4}>
      <VerifyForm />
    </RegistrationGate>
  );
}
