import {
  forwardRef,
  useRef,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type DragEvent,
} from 'react';
import { Search, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
export const fieldClass =
  'min-h-11 w-full rounded-lg border border-outline bg-surface px-3 py-2 text-body placeholder:text-muted disabled:opacity-50';
export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldClass, className)} {...props} />
));
Input.displayName = 'Input';
export function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted" />
      <Input type="search" aria-label="Search" className="pl-10" {...props} />
    </div>
  );
}
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldClass, 'min-h-28', className)}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
export function FileUpload({
  onFiles,
  accept,
  multiple = false,
  disabled = false,
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  function drop(e: DragEvent) {
    e.preventDefault();
    setDrag(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    const allowed = files.filter(
      (file) =>
        !accept ||
        accept.split(',').some((rule) => {
          const r = rule.trim();
          return r.startsWith('.')
            ? file.name.toLowerCase().endsWith(r.toLowerCase())
            : r.endsWith('/*')
              ? file.type.startsWith(r.slice(0, -1))
              : file.type === r;
        }),
    );
    onFiles(multiple ? allowed : allowed.slice(0, 1));
  }
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={drop}
    >
      <button
        type="button"
        disabled={disabled}
        className={cn(
          'flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-outline bg-surface p-6 text-caption disabled:opacity-50',
          drag && 'bg-hover',
        )}
        onClick={() => ref.current?.click()}
      >
        <UploadCloud className="size-6" />
        <span>Choose files or drag them here</span>
        <span className="text-label text-muted">
          {accept || 'All file types'}
        </span>
      </button>
      <input
        ref={ref}
        className="sr-only"
        tabIndex={-1}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-label="Upload files"
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
    </div>
  );
}
