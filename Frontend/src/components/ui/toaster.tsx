import { Toaster as Sonner } from 'sonner';
import { useSettings } from '@/store/settingsStore';

export function Toaster() {
  const theme = useSettings((s) => s.theme);
  return (
    <Sonner
      theme={theme}
      position="top-center"
      offset="calc(var(--safe-top) + 12px)"
      toastOptions={{ classNames: { toast: '!rounded-xl !font-sans', title: '!text-[15px]' } }}
    />
  );
}
