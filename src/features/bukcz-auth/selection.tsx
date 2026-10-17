import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type SelectHTMLAttributes,
  type ReactNode,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Dialog } from './dialog';
function options(
  children: ReactNode,
): { value: string; label: ReactNode; disabled: boolean }[] {
  return Children.toArray(children).flatMap((child) => {
    if (
      !isValidElement<{
        value?: string;
        disabled?: boolean;
        children?: ReactNode;
      }>(child)
    )
      return [];
    if (child.type === 'option')
      return [
        {
          value: String(child.props.value ?? child.props.children ?? ''),
          label: child.props.children,
          disabled: !!child.props.disabled,
        },
      ];
    return options(child.props.children);
  });
}
/** Native form semantics are retained invisibly; all visible choices use accessible row cards. */
export function Selection({
  children,
  value,
  defaultValue,
  onChange,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const listId = useId(),
    [filter, setFilter] = useState('');
  const native = useRef<HTMLSelectElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const [local, setLocal] = useState(String(defaultValue ?? '')),
    [open, setOpen] = useState(false),
    [label, setLabel] = useState(
      String(props['aria-label'] ?? props.name ?? 'Choose option'),
    );
  const selected = String(value ?? local),
    rows = options(children);
  useEffect(() => {
    if (props['aria-label']) setLabel(String(props['aria-label']));
    else {
      const parent = native.current?.closest('label');
      const text =
        parent &&
        [...parent.childNodes]
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent)
          .join(' ')
          .trim();
      if (text) setLabel(text);
    }
  }, [props['aria-label']]);
  function choose(next: string) {
    const field = native.current;
    if (!field) return;
    field.value = next;
    field.dispatchEvent(new Event('change', { bubbles: true }));
    setLocal(next);
    setOpen(false);
  }
  return (
    <span className="campus-selection">
      <select
        {...props}
        ref={native}
        value={selected}
        className="campus-native-selection"
        tabIndex={-1}
        aria-hidden="true"
        onInvalid={(e) => {
          e.preventDefault();
          trigger.current?.focus();
          setOpen(true);
        }}
        onChange={(e) => {
          setLocal(e.target.value);
          onChange?.(e);
        }}
      >
        {children}
      </select>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-label={`${label} selection`}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        aria-expanded={open}
        disabled={props.disabled}
        className="campus-selection-trigger"
        onClick={() => {
          setFilter('');
          setOpen(true);
        }}
      >
        <span>
          {rows.find((r) => r.value === selected)?.label ?? 'Choose an option'}
        </span>
        <ChevronDown size={18} />
      </button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={label}
        className="campus-selection-dialog"
        variant="sheet"
        returnFocusRef={trigger}
      >
        {rows.length > 8 && (
          <input
            type="search"
            aria-label={`Find ${label.toLowerCase()} option`}
            placeholder="Search options…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        )}
        <div
          id={listId}
          role="listbox"
          aria-label={`${label} options`}
          className="campus-selection-rows"
          onKeyDown={(e) => {
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key))
              return;
            e.preventDefault();
            const choices = [
                ...e.currentTarget.querySelectorAll<HTMLButtonElement>(
                  'button:not(:disabled)',
                ),
              ],
              at = choices.indexOf(document.activeElement as HTMLButtonElement);
            const next =
              e.key === 'Home'
                ? 0
                : e.key === 'End'
                  ? choices.length - 1
                  : e.key === 'ArrowDown'
                    ? (at + 1) % choices.length
                    : (at - 1 + choices.length) % choices.length;
            choices[next]?.focus();
          }}
        >
          {rows
            .filter(
              (r) =>
                (r.value !== '' || !props.required) &&
                String(r.label)
                  .toLowerCase()
                  .includes(filter.trim().toLowerCase()),
            )
            .map((row) => (
              <button
                type="button"
                role="option"
                aria-selected={row.value === selected}
                disabled={row.disabled}
                key={row.value}
                className={row.value === selected ? 'selected' : ''}
                onClick={() => choose(row.value)}
              >
                <span>{row.label}</span>
                {row.value === selected && (
                  <span className="campus-selection-check">
                    <Check size={16} />
                  </span>
                )}
              </button>
            ))}
        </div>
      </Dialog>
    </span>
  );
}
