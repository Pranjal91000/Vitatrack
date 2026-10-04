import { useRef } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ExerciseType } from '@/Enumerations/ExerciseTypeEnum';
import { MeasurementType, MEASUREMENT_TYPE_OPTIONS } from '@/Enumerations/MeasurementTypeEnum';
import { useCreateExercise } from '@/hooks/useWorkouts';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const exerciseSchema = z.object({
  name: z.string().min(2, 'Name required'),
  type: z.enum(['Strength', 'Cardio', 'Mobility', 'Other'] as [string, ...string[]]),
  muscleGroups: z.string().optional(),
  measurementType: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? Number(v) : v))
    .pipe(z.number().min(0).max(5)),
});

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

interface CreateExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (exercise: { id: number; name: string; measurementType: number; demoMediaUrl?: string }) => void;
}

export function CreateExerciseDialog({ open, onOpenChange, onCreated }: CreateExerciseDialogProps) {
  const createExercise = useCreateExercise();
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: createExerciseAsync, isPending: isCreating } = createExercise;

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema) as Resolver<ExerciseFormValues>,
    defaultValues: {
      name: '',
      type: 'Strength' as const,
      muscleGroups: '',
      measurementType: MeasurementType.WeightReps,
    },
  });

  async function onSubmit(values: ExerciseFormValues) {
    const file = fileRef.current?.files?.[0];
    try {
      const created = await createExerciseAsync({
        name: values.name,
        type: ExerciseType[values.type as keyof typeof ExerciseType],
        muscleGroups: values.muscleGroups
          ? values.muscleGroups.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
        measurementType: values.measurementType,
      });

      const id = Number(created.id);
      let demoMediaUrl: string | undefined;
      if (file && id) {
        const fd = new FormData();
        fd.append('file', file);
        await api.post(`exercises/${id}/demo-media`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        demoMediaUrl = `exercises/${id}/demo-media`;
      }

      onCreated?.({
        id,
        name: values.name,
        measurementType: values.measurementType,
        demoMediaUrl: demoMediaUrl ?? created.demoMediaUrl ?? undefined,
      });

      onOpenChange(false);
      form.reset();
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      /* toast from mutation */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create custom exercise</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Bench press" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(['Strength', 'Cardio', 'Mobility', 'Other'] as const).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="measurementType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How you log sets</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MEASUREMENT_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          <span className="font-medium">{opt.label}</span>
                          <span className="text-muted-foreground text-xs block">{opt.description}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Controls which columns appear when logging workouts.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="muscleGroups"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Muscle groups (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Chest, Triceps" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="demo-video">Demo video (optional)</Label>
              <Input id="demo-video" ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime" />
              <p className="text-[0.8rem] text-muted-foreground">MP4, WebM, or QuickTime. Uploaded after the exercise is created.</p>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
