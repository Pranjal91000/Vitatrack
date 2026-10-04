import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, Film } from 'lucide-react';

type Props = {
  exerciseId: number;
  relativePath: string;
};

export function ExerciseDemoVideo({ exerciseId, relativePath }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || !relativePath) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    (async () => {
      try {
        const { data } = await api.get<Blob>(relativePath, {
          responseType: 'blob',
        });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(data);
        setSrc(objectUrl);
      } catch {
        if (!cancelled) setSrc(null);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, relativePath, exerciseId]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1 text-muted-foreground">
          <Film className="h-3.5 w-3.5" />
          Demo video
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {src ? (
          <video className="w-full max-h-48 rounded-md border bg-black" controls src={src} playsInline />
        ) : open ? (
          <p className="text-xs text-muted-foreground">Loading or unavailable…</p>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
