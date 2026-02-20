'use client';

import { useGlobalKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { ShortcutsHelpDialog } from '@/components/ui/shortcuts-help-dialog';

export function KeyboardShortcutsProvider() {
  const { helpOpen, setHelpOpen } = useGlobalKeyboardShortcuts();

  return <ShortcutsHelpDialog open={helpOpen} onOpenChange={setHelpOpen} />;
}
