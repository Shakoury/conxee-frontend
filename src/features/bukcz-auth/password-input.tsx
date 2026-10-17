import { useState, type InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
export function PasswordInput(
  props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>,
) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="password-field">
      <Input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </span>
  );
}
