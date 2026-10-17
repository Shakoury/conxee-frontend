import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { fieldClass } from './input';
export function Select({
  options,
  placeholder = 'Select an option',
  label,
  value,
  onValueChange,
  disabled,
}: {
  options: { value: string; label: string }[];
  placeholder?: string;
  label: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        aria-label={label}
        className={`${fieldClass} flex items-center justify-between gap-3`}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          className="z-50 min-w-[var(--radix-select-trigger-width)] rounded-lg border border-outline bg-surface p-1 shadow-lg"
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex min-h-11 cursor-pointer items-center rounded px-8 text-caption outline-none data-[highlighted]:bg-hover"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute left-2">
                  <Check className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
