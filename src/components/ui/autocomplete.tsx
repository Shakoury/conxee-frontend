import { useId, useState, type KeyboardEvent, type Ref } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Input } from './input';
export interface Suggestion {
  value: string;
  label: string;
  description?: string;
}
export function Autocomplete({
  id,
  label,
  value,
  onChange,
  options,
  onSelect,
  placeholder,
  invalid,
  describedBy,
  freeText = false,
  loading = false,
  emptyText = 'No matches found.',
  disabled = false,
  inputRef,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Suggestion[];
  onSelect: (option: Suggestion) => void;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  freeText?: boolean;
  loading?: boolean;
  emptyText?: string;
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  onBlur?: () => void;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  const matches = options
    .filter((o) => o.label.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 30);
  function select(option: Suggestion) {
    onSelect(option);
    setOpen(false);
    setActive(-1);
  }
  function key(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActive((i) =>
        matches.length
          ? e.key === 'ArrowDown'
            ? (i + 1) % matches.length
            : (i - 1 + matches.length) % matches.length
          : -1,
      );
    }
    if (e.key === 'Enter' && open && active >= 0 && matches[active]) {
      e.preventDefault();
      select(matches[active]);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
    if (e.key === 'Tab') setOpen(false);
  }
  return (
    <div className="relative">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted"
        />
        <Input
          id={id}
          ref={inputRef}
          role="combobox"
          aria-label={label}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && active >= 0 ? `${listId}-${active}` : undefined
          }
          aria-invalid={invalid}
          aria-describedby={describedBy}
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setOpen(false);
            onBlur?.();
          }}
          onChange={(e) => {
            onChange(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={key}
        />
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3.5 size-4 text-muted"
        />
      </div>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-64 overflow-auto rounded-xl border border-outline bg-surface p-1 shadow-lg"
        >
          {loading ? (
            <li role="presentation" className="p-3 text-caption text-muted">
              Searching…
            </li>
          ) : matches.length ? (
            matches.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={value === option.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(option)}
                onMouseEnter={() => setActive(index)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-3 text-caption ${active === index ? 'bg-hover' : ''}`}
              >
                <span>
                  {option.label}
                  {option.description && (
                    <span className="mt-1 block text-label text-muted">
                      {option.description}
                    </span>
                  )}
                </span>
                {value === option.label && (
                  <Check className="size-4 shrink-0" />
                )}
              </li>
            ))
          ) : (
            <li role="presentation" className="p-3 text-caption text-muted">
              {freeText && value
                ? 'New entry — continue with this name.'
                : emptyText}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
