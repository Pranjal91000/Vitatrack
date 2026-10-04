import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addDays } from 'date-fns';
import { Copy, MoreHorizontal, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DateSwitcher } from '@/components/layout/DateSwitcher';
import { Sheet } from '@/components/ui/sheet';
import { ErrorState, Loading, MenuItem } from '@/components/ui/primitives';
import { useCopyMeals, useDailyMeals, useMealSlots } from '@/hooks/useNutrition';
import { num, parseDate, servingLabel, todayISO, toISODate } from '@/lib/format';
import { errorMessage } from '@/lib/api';
import type { MealFood, MealSlot } from '@/types/api';
import { MacroSummary } from './MacroSummary';
import { AddFoodSheet, EntrySheet } from './FoodSheets';

export default function NutritionPage() {
  const [params, setParams] = useSearchParams();
  const date = params.get('date') ?? todayISO();
  const setDate = (d: string) => setParams(d === todayISO() ? {} : { date: d }, { replace: true });

  const day = useDailyMeals(date);
  const slots = useMealSlots();
  const copy = useCopyMeals();
  const [addTo, setAddTo] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [entry, setEntry] = useState<MealFood | null>(null);
  const [slotMenu, setSlotMenu] = useState<MealSlot | null>(null);

  const yesterday = toISODate(addDays(parseDate(date), -1));
  const openAdd = (slotId: number) => { setAddTo(slotId); setAdding(true); };

  return (
    <>
      <PageHeader title="Food" />
      <DateSwitcher date={date} onChange={setDate} />

      {day.isLoading || slots.isLoading ? (
        <Loading />
      ) : day.error || slots.error ? (
        <div className="mt-3"><ErrorState message={errorMessage(day.error ?? slots.error)} onRetry={() => { day.refetch(); slots.refetch(); }} /></div>
      ) : day.data && slots.data ? (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6 items-start">
          {/* Left Column: Macro Summary & Controls */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-24">
            <div className="card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Nutrition Goals</h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {day.data.goals.isCustom ? 'Custom Goals' : 'Calculated'}
                </span>
              </div>
              <MacroSummary consumed={day.data.total} goals={day.data.goals} />
            </div>

            <div className="card p-4 hidden lg:block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-3">Quick Actions</span>
              <div className="space-y-1.5">
                <button
                  onClick={() => copy.mutate({ fromDate: yesterday, toDate: date, mealSlotId: null })}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-raised hover:text-foreground transition-colors"
                >
                  <Copy className="h-4 w-4 text-primary" /> Copy all meals from yesterday
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Meal Slots */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {slots.data.map((slot) => {
                const meal = day.data!.meals.find((m) => m.mealSlotId === slot.id);
                const foods = meal?.foods ?? [];
                return (
                  <section key={slot.id} className="card overflow-hidden flex flex-col justify-between shadow-sm hover:border-line/80 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 px-4 pt-3.5 pb-1 border-b border-line/40">
                        <h2 className="flex-1 text-lg font-bold">{slot.name}</h2>
                        <span className="num text-sm font-semibold text-primary">{foods.length ? `${num(meal!.grandTotal.calories, 0)} kcal` : ''}</span>
                        <button onClick={() => setSlotMenu(slot)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-raised transition-colors" aria-label={`${slot.name} options`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      {foods.length > 0 ? (
                        <ul className="divide-y divide-line/30">
                          {foods.map((f) => (
                            <li key={f.id}>
                              <button onClick={() => setEntry(f)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-raised/60 transition-colors">
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-medium text-foreground text-sm">{f.food.name}</span>
                                  <span className="num block text-xs text-muted mt-0.5">
                                    {servingLabel(f.quantity, f.food.servingSize, f.food.unit)} · P {num(f.totals.proteinG, 0)}g · C {num(f.totals.carbsG, 0)}g
                                  </span>
                                </span>
                                <span className="num shrink-0 font-bold text-sm text-foreground">{f.totals.calories}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="px-4 py-6 text-center text-xs text-muted">No foods logged in {slot.name.toLowerCase()} yet.</p>
                      )}
                    </div>
                    <button onClick={() => openAdd(slot.id)} className="flex h-11 w-full items-center justify-center gap-2 border-t border-line/40 font-semibold text-sm text-primary hover:bg-raised/40 transition-colors">
                      <Plus className="h-4 w-4" /> Add food
                    </button>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <AddFoodSheet open={adding} onOpenChange={setAdding} date={date} slots={slots.data ?? []} slotId={addTo} />
      <EntrySheet entry={entry} onClose={() => setEntry(null)} />

      <Sheet open={!!slotMenu} onOpenChange={(o) => !o && setSlotMenu(null)} title={slotMenu?.name ?? ''}>
        <div className="divide-y divide-line overflow-hidden rounded-xl bg-raised/50">
          <MenuItem
            icon={<Copy />}
            label={`Copy ${slotMenu?.name.toLowerCase()} from the day before`}
            onClick={() => { copy.mutate({ fromDate: yesterday, toDate: date, mealSlotId: slotMenu?.id }); setSlotMenu(null); }}
          />
          <MenuItem
            icon={<Copy />}
            label="Copy the whole day before"
            onClick={() => { copy.mutate({ fromDate: yesterday, toDate: date, mealSlotId: null }); setSlotMenu(null); }}
          />
        </div>
      </Sheet>
    </>
  );
}
