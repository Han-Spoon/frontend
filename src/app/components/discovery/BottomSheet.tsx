import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { Language } from '../../App';
import { createTranslator } from '../../locales';

export function BottomSheet({
  title,
  description,
  children,
  onClose,
  language,
}: {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
  language: Language;
}) {
  const t = createTranslator(language);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-soy-ink/45 backdrop-blur-sm" />
        <Dialog.Content
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          className="fixed bottom-0 left-1/2 z-50 max-h-[88dvh] w-full max-w-[430px] -translate-x-1/2 overflow-y-auto rounded-t-[28px] border border-border-warm bg-rice-white px-5 pb-6 pt-4 shadow-xl"
        >
          <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-border-warm" />
          <Dialog.Title className="pe-10 text-xl font-extrabold tracking-tight">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mb-5 mt-2 pe-5 text-sm leading-6 text-text-secondary">
            {description}
          </Dialog.Description>
          <Dialog.Close
            className="absolute end-3 top-6 flex size-11 items-center justify-center rounded-full bg-surface-subtle"
            aria-label={t('닫기', 'Close', 'إغلاق')}
          >
            <X className="size-5" />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
