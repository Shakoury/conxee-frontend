import {
  useState,
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button, type ButtonProps } from '@/components/ui/button';
export function FormField({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-caption font-medium">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-2 text-label text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-caption font-medium text-foreground"
        >
          {error}
        </p>
      )}
    </div>
  );
}
export function fieldA11y(id: string, error?: string, hint?: boolean) {
  return {
    'aria-invalid': !!error,
    'aria-describedby':
      [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
        .filter(Boolean)
        .join(' ') || undefined,
  };
}
export const PasswordInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        className="pr-12"
      />
      <Button
        variant="icon"
        className="absolute right-0 top-0"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        disabled={props.disabled}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';
export function SubmitButton({
  pending,
  children,
  ...props
}: ButtonProps & { pending: boolean }) {
  return (
    <Button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      className="w-full"
      aria-busy={pending}
    >
      {pending && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </Button>
  );
}
export function FormError({ message }: { message?: string }) {
  return message ? (
    <p
      role="alert"
      className="rounded-lg border border-outline bg-hover p-3 text-caption"
    >
      {message}
    </p>
  ) : null;
}
