import * as React from 'react';
import { Drawer } from 'vaul';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Full-height sheet for pickers and long lists. */
  tall?: boolean;
  hideTitle?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Bottom sheet — the main modal surface: reachable with a thumb, dismissible with a swipe. */
export function Sheet({ open, onOpenChange, title, description, tall, hideTitle, footer, children }: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/55" />
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-xl flex-col rounded-t-2xl bg-surface outline-none',
            tall ? 'h-[92dvh]' : 'max-h-[92dvh]',
          )}
        >
          <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line" aria-hidden />
          <div className={cn('px-5 pb-2 pt-3', hideTitle && 'sr-only')}>
            <Drawer.Title className="font-display text-2xl font-semibold">{title}</Drawer.Title>
            {description ? (
              <Drawer.Description className="mt-0.5 text-sm text-muted">{description}</Drawer.Description>
            ) : (
              <Drawer.Description className="sr-only">{title}</Drawer.Description>
            )}
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4" data-vaul-no-drag>
            {children}
          </div>
          {footer && <div className="border-t px-5 pb-[calc(1rem+var(--safe-bottom))] pt-3">{footer}</div>}
          {!footer && <div className="h-[var(--safe-bottom)] shrink-0" />}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

interface ConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmSheet({ open, onOpenChange, title, description, confirmLabel, destructive, loading, onConfirm }: ConfirmProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="grid gap-2 pt-2">
        <button
          className={cn(
            'h-12 rounded-xl font-semibold disabled:opacity-50',
            destructive ? 'bg-destructive text-white' : 'bg-primary text-primary-foreground',
          )}
          disabled={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
        <button className="h-12 rounded-xl bg-raised font-semibold" onClick={() => onOpenChange(false)}>
          Cancel
        </button>
      </div>
    </Sheet>
  );
}
