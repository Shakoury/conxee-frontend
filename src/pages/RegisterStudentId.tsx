import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
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
import { studentSchema } from '@/lib/auth-schemas';
import { api } from '@/lib/api';
import { authError } from '@/lib/auth-errors';
function StudentForm() {
  const { data, update } = useRegistration();
  const navigate = useNavigate();
  const [error, setError] = useState(''),
    [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: { student_id: data.student_id },
  });
  async function finish(student_id: string) {
    if (pending) return;
    setPending(true);
    setError('');
    update({ student_id });
    try {
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          account_type: data.account_type,
          institution_id: data.institution_id,
          faculty: data.faculty,
          department: data.department,
          display_name: data.display_name,
          username: data.username,
          email: data.email,
          password: data.password,
          ...(student_id ? { student_id } : {}),
        }),
      });
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (cause) {
      setError(authError(cause));
    } finally {
      setPending(false);
    }
  }
  return (
    <AuthFrame
      step={5}
      back="/register/verify"
      title="One last thing"
      description="Add your student ID, or come back to it later."
      footer={<RegistrationFooter />}
    >
      <div className="mb-6 flex gap-3 rounded-xl bg-hover p-4">
        <GraduationCap className="size-6 shrink-0" />
        <p className="text-caption text-muted">
          This is optional. You can join Conxee now and add your registration
          number later.
        </p>
      </div>
      <form
        noValidate
        onSubmit={handleSubmit((values) => finish(values.student_id))}
        className="space-y-6"
      >
        <FormField
          id="student-id"
          label="Student ID / registration number (optional)"
          error={errors.student_id?.message}
        >
          <Input
            id="student-id"
            autoComplete="off"
            disabled={pending}
            {...register('student_id')}
            {...fieldA11y('student-id', errors.student_id?.message)}
          />
        </FormField>
        <FormError message={error} />
        <SubmitButton pending={pending}>
          {pending ? 'Creating your account…' : 'Create account'}
        </SubmitButton>
        <Button
          variant="ghost"
          className="w-full"
          disabled={pending}
          onClick={() => void finish('')}
        >
          Skip for now
        </Button>
      </form>
    </AuthFrame>
  );
}
export default function RegisterStudentId() {
  return (
    <RegistrationGate step={5}>
      <StudentForm />
    </RegistrationGate>
  );
}
