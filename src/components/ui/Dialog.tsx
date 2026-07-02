'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

import { cn } from '@/lib/utils/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

function DialogOverlay({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'dlg-overlay fixed inset-0 z-[var(--z-overlay)] bg-[rgb(20_18_16_/_0.5)] backdrop-blur-[2px]',
        className,
      )}
      {...props}
    />
  );
}

export interface DialogContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Bottom sheet on mobile (slides up, top-only radius). design §9.12. */
  sheet?: boolean;
  hideClose?: boolean;
}

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent({ className, children, sheet, hideClose, ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-[var(--z-modal)] bg-surface shadow-xl focus:outline-none',
          sheet
            ? 'sheet-content inset-x-0 bottom-0 rounded-t-xl p-5'
            : 'dlg-content top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-md rounded-lg p-6',
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md text-fg-muted hover:bg-bg-muted"
          >
            <X aria-hidden className="size-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
