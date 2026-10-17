import { useEffect, useState, type ReactNode } from 'react';
import { Inbox, TriangleAlert, WifiOff } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-label="Loading"
      role="status"
      className={cn('h-6 animate-pulse rounded-lg bg-hover', className)}
    />
  );
}
export function EmptyState({
  icon = <Inbox className="size-10" />,
  heading,
  subtext,
  action,
}: {
  icon?: ReactNode;
  heading: string;
  subtext: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      <div className="text-muted">{icon}</div>
      <h2 className="text-h3">{heading}</h2>
      <p className="max-w-sm text-caption text-muted">{subtext}</p>
      {action}
    </div>
  );
}
export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert">
      <EmptyState
        icon={<TriangleAlert className="size-12" />}
        heading="Unable to load"
        subtext={message}
        action={<Button onClick={onRetry}>Try again</Button>}
      />
    </div>
  );
}
export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return offline ? (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-solid px-4 py-3 text-caption text-on-solid"
    >
      <WifiOff className="size-4" />
      You’re offline. Check your connection.
    </div>
  ) : null;
}
