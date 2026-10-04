import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFoodSearch, useCreateMeal, useMealSlots, useCreateMealSlot } from '@/hooks/useMeals';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Trash2, Utensils } from 'lucide-react';
import { useDateStore } from '@/store/dateStore';
import { Card, CardContent } from '@/components/ui/card';
import { NutritionSummary } from './NutritionSummary';
import type { NutrientSummaryDto } from '@/types/api';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CreateFoodDialog } from './CreateFoodDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface MealItemBuilder {
  foodId: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSize: number;
  unit: string;
  quantity: number;
}

const mealSchema = z.object({
  mealSlotId: z.coerce.number().min(1, 'Choose a meal type'),
  notes: z.string().optional(),
});

type MealFormValues = z.infer<typeof mealSchema>;

export function MealBuilder() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MealItemBuilder[]>([]);
  const [search, setSearch] = useState('');
  const [openCombobox, setOpenCombobox] = useState(false);
  const [customSlotName, setCustomSlotName] = useState('');

  const currentDate = useDateStore((state) => state.currentDate);
  const createMeal = useCreateMeal();
  const { data: slots = [], isLoading: slotsLoading } = useMealSlots();
  const createSlot = useCreateMealSlot();
  const { data: searchResults, isLoading: isSearching } = useFoodSearch(search);

  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealSchema) as Resolver<MealFormValues>,
    defaultValues: { mealSlotId: 0, notes: '' },
  });

  const addItem = (food: {
    id: string;
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    servingSize: number;
    unit: string;
  }) => {
    setItems((prev) => [
      ...prev,
      {
        foodId: food.id,
        name: food.name,
        calories: food.calories,
        proteinG: food.proteinG,
        carbsG: food.carbsG,
        fatG: food.fatG,
        servingSize: food.servingSize,
        unit: food.unit,
        quantity: 1,
      },
    ]);
    setOpenCombobox(false);
    setSearch('');
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item)));
  };

  const totals: NutrientSummaryDto = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories * item.quantity,
      proteinG: acc.proteinG + item.proteinG * item.quantity,
      carbsG: acc.carbsG + item.carbsG * item.quantity,
      fatG: acc.fatG + item.fatG * item.quantity,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  const onSubmit = (values: MealFormValues) => {
    if (items.length === 0) return;

    createMeal.mutate(
      {
        date: currentDate,
        mealSlotId: values.mealSlotId,
        notes: values.notes || undefined,
        foods: items.map((i) => ({ foodId: Number(i.foodId), quantity: i.quantity })),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setItems([]);
          form.reset({ mealSlotId: 0, notes: '' });
          setCustomSlotName('');
        },
      }
    );
  };

  const handleAddCustomSlot = async () => {
    const name = customSlotName.trim();
    if (!name) return;
    try {
      const created = await createSlot.mutateAsync({ name });
      form.setValue('mealSlotId', Number(created.id));
      setCustomSlotName('');
    } catch {
      /* toast in hook */
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="mr-2 h-4 w-4" /> Log meal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[min(90vh,720px)] flex flex-col p-0 gap-0 w-[calc(100vw-1rem)]">
        <DialogHeader className="p-4 sm:p-6 pb-2 shrink-0 border-b">
          <DialogTitle>Build meal</DialogTitle>
          <DialogDescription>Pick a meal type (for analytics), then add foods.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-4 space-y-6">
          <div className="space-y-2">
            <Label>Meal type</Label>
            <Select
              disabled={slotsLoading}
              value={String(form.watch('mealSlotId') || '')}
              onValueChange={(v) => form.setValue('mealSlotId', Number(v), { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder={slotsLoading ? 'Loading…' : 'Select breakfast, lunch…'} />
              </SelectTrigger>
              <SelectContent>
                {slots.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.mealSlotId ? (
              <p className="text-sm text-destructive">{form.formState.errors.mealSlotId.message}</p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Custom type</Label>
                <Input
                  value={customSlotName}
                  onChange={(e) => setCustomSlotName(e.target.value)}
                  placeholder="e.g. Second lunch"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                className="sm:shrink-0"
                disabled={!customSlotName.trim() || createSlot.isPending}
                onClick={handleAddCustomSlot}
              >
                Add type
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any context…"
              className="min-h-[64px] resize-none"
              {...form.register('notes')}
            />
          </div>

          <div className="space-y-2">
            <Label>Add foods</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between">
                  <span className="text-muted-foreground">
                    <Search className="mr-2 h-4 w-4 inline" /> Search foods…
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[min(calc(100vw-2rem),400px)] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search foods…" value={search} onValueChange={setSearch} />
                  <CommandList>
                    <CommandEmpty>{isSearching ? 'Searching…' : 'No foods found.'}</CommandEmpty>
                    <CommandGroup>
                      {searchResults?.map((food) => (
                        <CommandItem key={food.id} value={food.name} onSelect={() => addItem(food)}>
                          <div className="flex flex-col w-full">
                            <span className="font-medium">{food.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {food.calories} kcal • {food.servingSize}
                              {food.unit}
                            </span>
                          </div>
                          <Plus className="ml-auto h-4 w-4 opacity-50" />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="pt-2">
              <CreateFoodDialog />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Selected items ({items.length})</Label>
              {items.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setItems([])}
                  className="h-auto p-0 text-destructive text-xs hover:bg-transparent"
                >
                  Clear all
                </Button>
              ) : null}
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                <Utensils className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No foods added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm leading-none mb-1">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(item.calories * item.quantity)} kcal • {Math.round(item.proteinG * item.quantity)}g P
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive -mr-2 -mt-2"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Label className="text-[10px] text-muted-foreground mb-1 block">
                            Quantity × {item.servingSize}
                            {item.unit}
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(index, parseFloat(e.target.value))}
                              className="h-7 w-20 text-xs"
                            />
                            <span className="text-xs text-muted-foreground">
                              = {Math.round(item.servingSize * item.quantity)} {item.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t bg-muted/40 p-4 sm:p-6 space-y-4 shrink-0">
          <NutritionSummary totals={totals} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={createMeal.isPending || items.length === 0}>
              {createMeal.isPending ? 'Logging…' : 'Log meal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
