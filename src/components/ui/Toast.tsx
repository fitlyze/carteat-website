'use client';

import { X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/utils/cn';

type Tone = 'info' | 'warning' | 'danger' | 'success';

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  toast: (t: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const TONE_CLASS: Record<Tone, string> = {
  info: 'border-info text-fg',
  warning: 'border-warning text-fg',
  danger: 'border-danger text-fg',
  success: 'border-success text-fg',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 6000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className="fixed inset-x-0 bottom-4 z-[var(--z-toast)] flex flex-col items-center gap-2 px-4"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border-l-4 bg-surface p-4 shadow-lg',
              TONE_CLASS[t.tone],
            )}
          >
            <p className="flex-1 text-sm">{t.message}</p>
            {t.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  t.onAction?.();
                  dismiss(t.id);
                }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {t.actionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Close"
              className="inline-flex size-6 items-center justify-center rounded-full text-fg-muted hover:bg-bg-muted"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Listens for offline events and surfaces a toast (E11-S1). */
export function OfflineWatcher({ message }: { message: string }) {
  const { toast } = useToast();
  useEffect(() => {
    const onOffline = () => toast({ message, tone: 'warning' });
    window.addEventListener('offline', onOffline);
    return () => window.removeEventListener('offline', onOffline);
  }, [toast, message]);
  return null;
}
