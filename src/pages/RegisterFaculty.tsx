import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  AuthFrame,
  RegistrationGate,
  RegistrationFooter,
} from '@/components/auth/AuthFrame';
import { Autocomplete } from '@/components/ui/autocomplete';
import { FormField, fieldA11y } from '@/components/auth/FormFields';
import { Button } from '@/components/ui/button';
import { useRegistration } from '@/contexts/RegistrationContext';
import { facultySchema } from '@/lib/auth-schemas';
import { facultySuggestions, departmentSuggestions } from '@/lib/catalogue';
function FacultyForm() {
  const { data, update } = useRegistration();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(facultySchema),
    defaultValues: { faculty: data.faculty, department: data.department },
  });
  const faculty = watch('faculty');
  return (
    <AuthFrame
      step={2}
      back="/register"
      title="What are you studying?"
      description="Find your faculty and department, or add your own."
      footer={<RegistrationFooter />}
    >
      <form
        noValidate
        className="space-y-6"
        onSubmit={handleSubmit((values) => {
          update(values);
          navigate('/register/details');
        })}
      >
        <FormField
          id="faculty"
          label="Faculty"
          error={errors.faculty?.message}
          hint="Choose a suggestion or enter a new faculty."
        >
          <Controller
            control={control}
            name="faculty"
            render={({ field }) => (
              <Autocomplete
                id="faculty"
                label="Faculty"
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  setValue('department', '');
                }}
                onSelect={(option) => {
                  field.onChange(option.label);
                  setValue('department', '');
                }}
                options={facultySuggestions(data.institution_source_id)}
                freeText
                placeholder="e.g. Faculty of Science"
                invalid={!!errors.faculty}
                describedBy={
                  fieldA11y('faculty', errors.faculty?.message, true)[
                    'aria-describedby'
                  ]
                }
              />
            )}
          />
        </FormField>
        <FormField
          id="department"
          label="Department"
          error={errors.department?.message}
          hint="Choose a suggestion or enter a new department."
        >
          <Controller
            control={control}
            name="department"
            render={({ field }) => (
              <Autocomplete
                id="department"
                label="Department"
                value={field.value}
                onChange={field.onChange}
                onSelect={(option) => field.onChange(option.label)}
                options={departmentSuggestions(
                  data.institution_source_id,
                  faculty,
                )}
                freeText
                placeholder="e.g. Computer Science"
                invalid={!!errors.department}
                describedBy={
                  fieldA11y('department', errors.department?.message, true)[
                    'aria-describedby'
                  ]
                }
              />
            )}
          />
        </FormField>
        <Button type="submit" className="w-full">
          Continue
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </AuthFrame>
  );
}
export default function RegisterFaculty() {
  return (
    <RegistrationGate step={2}>
      <FacultyForm />
    </RegistrationGate>
  );
}
