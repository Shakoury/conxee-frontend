import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useRef, type ReactNode } from 'react';
import { Button } from './button';
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const previousFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          onOpenAutoFocus={() => {
            previousFocus.current = document.activeElement as HTMLElement;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            previousFocus.current?.focus();
          }}
          {...(!description ? { 'aria-describedby': undefined } : {})}
          className="fixed left-1/2 top-1/2 z-50 max-h-[85dvh] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-surface p-6 shadow-xl"
        >
          <header className="pr-10">
            <Dialog.Title className="text-h3">{title}</Dialog.Title>
            {description ? (
              <Dialog.Description className="mt-2 text-caption text-muted">
                {description}
              </Dialog.Description>
            ) : null}
          </header>
          <div className="mt-6">{children}</div>
          {footer && (
            <footer className="mt-6 flex justify-end gap-3">{footer}</footer>
          )}
          <Dialog.Close asChild>
            <Button
              variant="icon"
              aria-label="Close dialog"
              className="absolute right-3 top-3"
            >
              <X className="size-5" />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function ConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  title = 'Delete this item?',
  description = 'This action cannot be undone.',
  pending = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  pending?: boolean;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void onConfirm()}
            disabled={pending}
          >
            {pending ? 'Deleting…' : 'Delete'}
          </Button>
        </>
      }
    />
  );
}
