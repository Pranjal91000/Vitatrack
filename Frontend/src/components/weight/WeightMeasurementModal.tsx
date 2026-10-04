
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { useCreateWeight, useUpdateWeight, useDeleteWeight } from '@/hooks/useWeightTracker';
import type { WeightMeasurement } from '@/types/api';

// ─── Validation Schema ─────────────────────────────────────────────────────────
const schema = z.object({
    weight: z
        .number({ message: 'Please enter a valid weight' })
        .min(20, 'Weight must be at least 20 kg')
        .max(500, 'Weight must be less than 500 kg'),
    recordedOn: z.string().min(1, 'Date is required'),
});

type FormValues = z.infer<typeof schema>;

// ─── Props ─────────────────────────────────────────────────────────────────────
interface WeightMeasurementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** If provided, the modal is in Edit mode. Otherwise it's Add mode. */
    editingMeasurement?: WeightMeasurement | null;
}

export function WeightMeasurementModal({
    open,
    onOpenChange,
    editingMeasurement,
}: WeightMeasurementModalProps) {
    const isEditing = !!editingMeasurement;
    const createMutation = useCreateWeight();
    const updateMutation = useUpdateWeight();
    const deleteMutation = useDeleteWeight();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            weight: undefined,
            recordedOn: format(new Date(), 'yyyy-MM-dd'),
        },
    });

    // Populate form when editing or reset when opening for Add
    useEffect(() => {
        if (!open) return;

        if (editingMeasurement) {
            setValue('weight', editingMeasurement.weight);
            setValue('recordedOn', editingMeasurement.recordedOn);
        } else {
            reset({
                weight: undefined,
                recordedOn: format(new Date(), 'yyyy-MM-dd'),
            });
        }
    }, [open, editingMeasurement, reset, setValue]);

    const onSubmit = async (values: FormValues) => {
        if (isEditing && editingMeasurement) {
            await updateMutation.mutateAsync({
                id: editingMeasurement.id,
                weight: values.weight,
                recordedOn: values.recordedOn,
            });
        } else {
            await createMutation.mutateAsync({
                weight: values.weight,
                recordedOn: values.recordedOn,
            });
        }

        onOpenChange(false);
    };

    const handleDelete = async () => {
        if (!editingMeasurement) return;
        await deleteMutation.mutateAsync(editingMeasurement.id);
        onOpenChange(false);
    };

    const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm" id="weight-measurement-modal">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        {isEditing ? 'Edit Measurement' : 'Add Weight'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the weight or date for this measurement.'
                            : 'Record your current body weight. You can also log past measurements.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2" id="weight-form">
                    {/* Weight Input */}
                    <div className="space-y-2">
                        <Label htmlFor="weight-input">Weight</Label>
                        <div className="relative">
                            <Input
                                id="weight-input"
                                type="number"
                                step="0.1"
                                placeholder="82.5"
                                className="pr-12"
                                {...register('weight', { valueAsNumber: true })}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground pointer-events-none">
                                kg
                            </span>
                        </div>
                        {errors.weight && (
                            <p className="text-xs text-destructive">{errors.weight.message}</p>
                        )}
                    </div>

                    {/* Date Input */}
                    <div className="space-y-2">
                        <Label htmlFor="date-input">Date</Label>
                        <Input
                            id="date-input"
                            type="date"
                            max={format(new Date(), 'yyyy-MM-dd')}
                            {...register('recordedOn')}
                        />
                        {errors.recordedOn && (
                            <p className="text-xs text-destructive">{errors.recordedOn.message}</p>
                        )}
                    </div>
                </form>

                <DialogFooter className="flex flex-row items-center justify-between sm:justify-between gap-2">
                    {isEditing ? (
                        <Button
                            type="button"
                            variant="ghost"
                            id="weight-modal-delete"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 px-3"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    ) : <div />}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            id="weight-modal-cancel"
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            id="weight-modal-save"
                            type="submit"
                            form="weight-form"
                            disabled={isPending}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                            onClick={handleSubmit(onSubmit)}
                        >
                            {isPending ? 'Saving…' : 'Update'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
