import { useEffect, useRef } from 'react';

/** Give a dismissible overlay one history entry without changing its route. */
export function useOverlayHistory(
  open: boolean,
  enabled: boolean,
  close: () => void,
) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open || !enabled) return;
    let disposed = false;
    const marker = crypto.randomUUID();
    const onPop = () => {
      if (history.state?.cxOverlay !== marker) closeRef.current();
    };
    // React StrictMode's probe must not create an entry or initiate an async back.
    queueMicrotask(() => {
      if (disposed) return;
      history.pushState({ ...history.state, cxOverlay: marker }, '');
      window.addEventListener('popstate', onPop);
    });
    return () => {
      disposed = true;
      window.removeEventListener('popstate', onPop);
      // A destination link already created a new entry: never navigate away from it.
      if (history.state?.cxOverlay === marker) history.back();
    };
  }, [open, enabled]);
}
