import * as Dialog from '@radix-ui/react-dialog';
import { useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  side = 'side',
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  children: ReactNode;
  side?: 'bottom' | 'side';
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
          aria-describedby={undefined}
          className={cn(
            'fixed z-50 overflow-auto bg-surface p-6 shadow-xl',
            side === 'bottom'
              ? 'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl pb-[max(24px,env(safe-area-inset-bottom))]'
              : 'inset-y-0 right-0 w-full max-w-md',
          )}
        >
          <Dialog.Title className="pr-12 text-h3">{title}</Dialog.Title>
          <div className="mt-6">{children}</div>
          <Dialog.Close asChild>
            <Button
              variant="icon"
              aria-label="Close panel"
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
