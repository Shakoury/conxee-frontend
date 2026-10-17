import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import {
  AuthFrame,
  RegistrationGate,
  RegistrationFooter,
} from '@/components/auth/AuthFrame';
import {
  FormField,
  PasswordInput,
  SubmitButton,
  FormError,
  fieldA11y,
} from '@/components/auth/FormFields';
import { Input } from '@/components/ui/input';
import { useRegistration } from '@/contexts/RegistrationContext';
import { detailsSchema, type Details } from '@/lib/auth-schemas';
import { api } from '@/lib/api';
import { authError } from '@/lib/auth-errors';
function DetailsForm() {
  const { data, update } = useRegistration();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      display_name: data.display_name,
      username: data.username,
      email: data.email,
      password: data.password,
      confirm_password: data.password,
    },
  });
  async function submit(values: Details) {
    setError('');
    const { confirm_password: _, ...details } = values;
    update({
      ...details,
      emailVerified: data.email === details.email && data.emailVerified,
      codeSent: data.email === details.email && data.codeSent,
    });
    if (data.email === details.email && data.emailVerified) {
      navigate('/register/student-id');
      return;
    }
    try {
      if (data.email !== details.email || !data.codeSent) {
        await api('/auth/resend-verification', {
          method: 'POST',
          body: JSON.stringify({ email: details.email }),
        });
        update({ codeSent: true, resendAt: Date.now() + 60000 });
      }
      navigate('/register/verify');
    } catch (cause) {
      setError(authError(cause));
    }
  }
  return (
    <AuthFrame
      step={3}
      back="/register/faculty"
      title="Make it yours"
      description="A few details, and you’re one step closer."
      footer={<RegistrationFooter />}
    >
      <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
        {(['display_name', 'username', 'email'] as const).map((name) => (
          <FormField
            key={name}
            id={name}
            label={
              {
                display_name: 'Display name',
                username: 'Username',
                email: 'Email',
              }[name]
            }
            error={errors[name]?.message}
            hint={
              name === 'username'
                ? 'Letters, numbers and underscores.'
                : undefined
            }
          >
            <Input
              id={name}
              type={name === 'email' ? 'email' : 'text'}
              autoComplete={
                { display_name: 'name', username: 'username', email: 'email' }[
                  name
                ]
              }
              disabled={isSubmitting}
              {...register(name)}
              {...fieldA11y(name, errors[name]?.message, name === 'username')}
            />
          </FormField>
        ))}
        <FormField
          id="new-password"
          label="Password"
          error={errors.password?.message}
          hint="At least 8 characters. Make it unique to Conxee."
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
            {...fieldA11y('confirm-password', errors.confirm_password?.message)}
          />
        </FormField>
        <FormError message={error} />
        <SubmitButton pending={isSubmitting}>
          {isSubmitting ? 'Sending your code…' : 'Continue'}
        </SubmitButton>
        <p className="text-center text-label text-muted">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthFrame>
  );
}
export default function RegisterDetails() {
  return (
    <RegistrationGate step={3}>
      <DetailsForm />
    </RegistrationGate>
  );
}
