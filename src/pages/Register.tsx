import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap, Compass } from 'lucide-react';
import { AuthFrame, RegistrationFooter } from '@/components/auth/AuthFrame';
import { Autocomplete } from '@/components/ui/autocomplete';
import { FormField, FormError } from '@/components/auth/FormFields';
import { Button } from '@/components/ui/button';
import { useRegistration } from '@/contexts/RegistrationContext';
import { searchInstitutions, type Institution } from '@/lib/catalogue';
export default function Register() {
  const { data, update } = useRegistration();
  const [query, setQuery] = useState(data.institution_name);
  const [results, setResults] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false),
    [error, setError] = useState(''),
    [fieldError, setFieldError] = useState('');
  const [retry, setRetry] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    const controller = new AbortController();
    if (data.institution_id && query === data.institution_name) {
      setLoading(false);
      return () => controller.abort();
    }
    if (query.trim().length < 2) {
      setResults([]);
      setError('');
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    const timer = setTimeout(() => {
      searchInstitutions(query, controller.signal)
        .then((items) => {
          setResults(items);
          setError('');
        })
        .catch((e) => {
          if (e.name !== 'AbortError') {
            setResults([]);
            setError('Institution search is unavailable. Please retry.');
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, retry, data.institution_id, data.institution_name]);
  function change(value: string) {
    setQuery(value);
    setFieldError('');
    update({
      institution_id: '',
      institution_name: '',
      institution_source_id: '',
      faculty: '',
      department: '',
    });
  }
  return (
    <AuthFrame
      step={1}
      title="Find your institution"
      description="Start with the place you call campus."
      footer={<RegistrationFooter />}
    >
      <form
        noValidate
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!data.institution_id) {
            setFieldError('Choose an institution from the results.');
            document.getElementById('institution')?.focus();
            return;
          }
          navigate('/register/faculty');
        }}
      >
        <fieldset>
          <legend className="mb-3 text-caption font-medium">
            Join Conxee as
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                {
                  value: 'student',
                  label: 'Student',
                  description: 'Currently enrolled',
                  icon: GraduationCap,
                },
                {
                  value: 'aspirant',
                  label: 'Aspirant',
                  description: 'Seeking admission',
                  icon: Compass,
                },
              ] as const
            ).map(({ value, label, description, icon: Icon }) => (
              <label key={value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="account-type"
                  value={value}
                  checked={data.account_type === value}
                  onChange={() => update({ account_type: value })}
                  className="peer sr-only"
                />
                <span className="flex min-h-28 flex-col gap-2 rounded-xl border border-outline bg-surface p-4 peer-checked:border-solid peer-checked:bg-hover peer-checked:ring-1 peer-checked:ring-solid peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-solid">
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="text-caption font-semibold">{label}</span>
                  <span className="text-label text-muted">{description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <FormField
          id="institution"
          label="Institution"
          error={fieldError}
          hint="Search NUC-approved Nigerian institutions."
        >
          <Autocomplete
            id="institution"
            label="Institution"
            value={query}
            onChange={change}
            options={results.map((i) => ({ value: i.id, label: i.name }))}
            onSelect={(option) => {
              const item = results.find((i) => i.id === option.value)!;
              setQuery(item.name);
              setFieldError('');
              update({
                institution_id: item.id,
                institution_name: item.name,
                institution_source_id: item.sourceId ?? '',
              });
            }}
            loading={loading}
            placeholder="Search your institution"
            invalid={!!fieldError}
            describedBy={fieldError ? 'institution-error' : 'institution-hint'}
            emptyText={
              query.length < 2
                ? 'Type at least 2 characters to search.'
                : 'No institutions found. Try another name.'
            }
          />
        </FormField>
        {data.institution_id && (
          <p className="flex items-center gap-2 rounded-lg bg-hover p-3 text-caption">
            <GraduationCap className="size-5 shrink-0" />
            {data.institution_name}
          </p>
        )}
        <FormError message={error} />
        {error && (
          <Button
            variant="secondary"
            onClick={() => {
              setRetry((i) => i + 1);
              document.getElementById('institution')?.focus();
            }}
          >
            Retry search
          </Button>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          Continue
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </AuthFrame>
  );
}
