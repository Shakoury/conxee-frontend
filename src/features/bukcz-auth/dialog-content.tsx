import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode, RefObject } from 'react';
export function DialogContent({
  open,
  onOpenChange,
  title,
  children,
  fullScreen = false,
  className = '',
  variant = 'dialog',
  returnFocusRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  fullScreen?: boolean;
  className?: string;
  variant?: 'dialog' | 'drawer' | 'sheet';
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const header = (
    <>
      <DialogPrimitive.Title className="modal-title">
        {title}
      </DialogPrimitive.Title>
      <DialogPrimitive.Close className="modal-close" aria-label="Close dialog">
        <X size={20} />
      </DialogPrimitive.Close>
    </>
  );
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="modal-overlay cx-dialog-overlay bukcz-auth-overlay" />
        <DialogPrimitive.Content
          className={`modal-content cx-dialog bukcz-auth-dialog ${variant === 'drawer' ? 'cx-drawer' : variant === 'sheet' ? 'cx-sheet' : ''} ${fullScreen ? 'fullscreen-dialog' : ''} ${className}`}
          onCloseAutoFocus={(event) => {
            if (returnFocusRef?.current?.isConnected) {
              event.preventDefault();
              returnFocusRef.current.focus();
            }
          }}
          aria-describedby={undefined}
        >
          {variant !== 'dialog' ? (
            <>
              <header className="cx-overlay-header">{header}</header>
              <div className="cx-overlay-body">{children}</div>
            </>
          ) : (
            <>
              {header}
              {children}
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
