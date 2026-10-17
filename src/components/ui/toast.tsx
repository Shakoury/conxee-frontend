import * as ToastPrimitive from '@radix-ui/react-toast';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { Button } from './button';
type Notice = {
  id: number;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info';
};
const Context = createContext<((notice: Omit<Notice, 'id'>) => void) | null>(
  null,
);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notice[]>([]);
  return (
    <Context.Provider
      value={(notice) =>
        setItems((all) => [
          ...all,
          { ...notice, id: Date.now() + Math.random() },
        ])
      }
    >
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {items.map((item) => {
          const Icon = { success: CheckCircle, error: AlertCircle, info: Info }[
            item.variant
          ];
          return (
            <ToastPrimitive.Root
              key={item.id}
              duration={5000}
              onOpenChange={(open) => {
                if (!open)
                  setItems((all) => all.filter((n) => n.id !== item.id));
              }}
              className="flex items-start gap-3 rounded-xl border border-outline bg-surface p-4 shadow-lg"
            >
              <Icon className="mt-1 size-5 shrink-0" />
              <div className="flex-1">
                <ToastPrimitive.Title className="text-caption font-semibold">
                  {item.title}
                </ToastPrimitive.Title>
                {item.description && (
                  <ToastPrimitive.Description className="text-caption text-muted">
                    {item.description}
                  </ToastPrimitive.Description>
                )}
              </div>
              <ToastPrimitive.Close asChild>
                <Button variant="icon" aria-label="Dismiss notification">
                  <X className="size-4" />
                </Button>
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport className="fixed bottom-24 right-4 z-[60] flex w-[calc(100%-32px)] max-w-sm flex-col gap-3 md:bottom-4" />
      </ToastPrimitive.Provider>
    </Context.Provider>
  );
}
export function useToast() {
  const value = useContext(Context);
  if (!value) throw Error('useToast requires ToastProvider');
  return value;
}
