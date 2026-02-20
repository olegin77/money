'use client';

import { useT } from '@/hooks/use-t';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ShortcutsHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent);
const mod = isMac ? '\u2318' : 'Ctrl';

const SHORTCUT_GROUPS = [
  {
    titleKey: 'kb_navigation' as const,
    items: [
      { keys: [`${mod}+N`], labelKey: 'kb_new_expense' as const },
      { keys: [`${mod}+I`], labelKey: 'kb_new_income' as const },
    ],
  },
  {
    titleKey: 'kb_general' as const,
    items: [
      { keys: [`${mod}+?`], labelKey: 'kb_show_shortcuts' as const },
      { keys: ['Esc'], labelKey: 'kb_close_dialog' as const },
    ],
  },
];

export function ShortcutsHelpDialog({ open, onOpenChange }: ShortcutsHelpDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('kb_title')}</DialogTitle>
          <DialogDescription>{t('kb_description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {SHORTCUT_GROUPS.map(group => (
            <div key={group.titleKey}>
              <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                {t(group.titleKey)}
              </p>
              <div className="space-y-2">
                {group.items.map(item => (
                  <div
                    key={item.labelKey}
                    className="flex items-center justify-between rounded-lg px-1 py-1.5"
                  >
                    <span className="text-foreground text-sm">{t(item.labelKey)}</span>
                    <div className="flex gap-1">
                      {item.keys.map(key => (
                        <kbd
                          key={key}
                          className="border-border bg-card inline-flex min-w-[28px] items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium shadow-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
