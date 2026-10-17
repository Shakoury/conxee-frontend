import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { useOverlayHistory } from './use-overlay-history';
export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  fullScreen?: boolean;
  className?: string;
  variant?: 'dialog' | 'drawer' | 'sheet';
  dismissOnBack?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
};
const Content = lazy(() =>
  import('./dialog-content').then((module) => ({
    default: module.DialogContent,
  })),
);
function PendingDialog({
  failed = false,
  ...props
}: DialogProps & { failed?: boolean }) {
  const element = useRef<HTMLDialogElement>(null),
    titleId = useId();
  useEffect(() => {
    const dialog = element.current;
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      const target = props.returnFocusRef?.current ?? previous;
      if (target?.isConnected) target.focus();
    };
  }, [props.returnFocusRef]);
  return (
    <dialog
      ref={element}
      aria-label={failed ? 'Dialog unavailable' : 'Dialog loading'}
      className="modal-content cx-dialog bukcz-auth-dialog cx-dialog-pending"
      onCancel={(event) => {
        event.preventDefault();
        props.onOpenChange(false);
      }}
    >
      <h2 id={titleId} className="modal-title">
        {failed ? `Unable to open ${props.title}` : `Preparing ${props.title}`}
      </h2>
      <button
        type="button"
        className="modal-close"
        aria-label="Close dialog"
        onClick={() => props.onOpenChange(false)}
      >
        ×
      </button>
      <p role={failed ? 'alert' : 'status'}>
        {failed
          ? 'The dialog could not load. Reload the page to try again.'
          : 'Preparing dialog…'}
      </p>
      {failed && (
        <button
          type="button"
          className="btn cx-button btn-outline"
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
      )}
    </dialog>
  );
}
class DialogBoundary extends Component<DialogProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <PendingDialog {...this.props} failed />
    ) : (
      this.props.children
    );
  }
}
/** Load focus/portal primitives only when needed; closed dialogs retain no mounted content. */
export function Dialog(props: DialogProps) {
  useOverlayHistory(
    props.open,
    props.dismissOnBack ??
      (props.variant === 'drawer' || props.variant === 'sheet'),
    () => props.onOpenChange(false),
  );
  if (!props.open) return null;
  return (
    <DialogBoundary {...props}>
      <Suspense fallback={<PendingDialog {...props} />}>
        <Content {...props} />
      </Suspense>
    </DialogBoundary>
  );
}
