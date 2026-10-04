import { useEffect, useMemo, useState } from 'react';
import { useOnChange } from '@/lib/hooks';
import { ChevronLeft, Minus, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Empty, Field, Input, Loading, Segmented, Select } from '@/components/ui/primitives';
import { useAddEntry, useCreateFood, useDeleteEntry, useFoodSearch, useMyFoods, useRecentFoods, useUpdateEntry } from '@/hooks/useNutrition';
import { num } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Food, MealFood, MealSlot } from '@/types/api';

const isMass = (unit: string) => unit === 'g' || unit === 'ml';

function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function FoodRow({ food, onClick }: { food: Food; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-raised">
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{food.name}</span>
        <span className="num block truncate text-sm text-muted">
          {num(food.servingSize, 0)} {food.unit} · P {num(food.proteinG)} · C {num(food.carbsG)} · F {num(food.fatG)}
        </span>
      </span>
      <span className="num shrink-0 text-right">
        <span className="block font-display text-lg font-semibold">{food.calories}</span>
        <span className="block text-xs text-muted">kcal</span>
      </span>
    </button>
  );
}

/** Servings stepper + (for g/ml foods) an amount field kept in sync. */
export function QuantityEditor({ food, quantity, onChange }: { food: Food; quantity: number; onChange: (q: number) => void }) {
  // Typed text wins while editing; any change from the stepper shows the computed amount again.
  const [draft, setDraft] = useState<string | null>(null);
  const amount = draft ?? String(Math.round(quantity * food.servingSize * 10) / 10);
  const set = (q: number) => { setDraft(null); onChange(q); };
  const totals = {
    kcal: Math.round(food.calories * quantity),
    p: food.proteinG * quantity,
    c: food.carbsG * quantity,
    f: food.fatG * quantity,
  };
  const step = (d: number) => set(Math.max(0.25, Math.round((quantity + d) * 4) / 4));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2 rounded-xl bg-raised/60 p-3 text-center">
        <div><div className="num font-display text-2xl font-semibold">{totals.kcal}</div><div className="text-xs text-muted">kcal</div></div>
        <div><div className="num font-display text-2xl font-semibold text-protein">{num(totals.p)}</div><div className="text-xs text-muted">protein</div></div>
        <div><div className="num font-display text-2xl font-semibold text-carbs">{num(totals.c)}</div><div className="text-xs text-muted">carbs</div></div>
        <div><div className="num font-display text-2xl font-semibold text-fat">{num(totals.f)}</div><div className="text-xs text-muted">fat</div></div>
      </div>

      {isMass(food.unit) && (
        <Field label={`Amount (${food.unit})`}>
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setDraft(e.target.value);
              const v = Number(e.target.value.replace(',', '.'));
              if (v > 0) onChange(Math.round((v / food.servingSize) * 1000) / 1000);
            }}
            onFocus={(e) => e.target.select()}
          />
        </Field>
      )}

      <div>
        <span className="label">Servings of {num(food.servingSize, 0)} {food.unit}</span>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="secondary" onClick={() => step(-0.5)} aria-label="Fewer servings"><Minus /></Button>
          <div className="num flex-1 text-center font-display text-3xl font-semibold">{num(quantity, 2)}</div>
          <Button size="icon" variant="secondary" onClick={() => step(0.5)} aria-label="More servings"><Plus /></Button>
        </div>
        <div className="mt-2 flex gap-2">
          {[0.5, 1, 1.5, 2, 3].map((q) => (
            <button
              key={q}
              onClick={() => set(q)}
              className={cn('h-9 flex-1 rounded-lg text-sm font-semibold', quantity === q ? 'bg-primary text-primary-foreground' : 'bg-raised')}
            >
              {q}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface AddProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  date: string;
  slots: MealSlot[];
  slotId: number | null;
}

export function AddFoodSheet({ open, onOpenChange, date, slots, slotId }: AddProps) {
  const [tab, setTab] = useState<'recent' | 'search' | 'mine'>('recent');
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [slot, setSlot] = useState<number | null>(slotId);
  const [creating, setCreating] = useState(false);
  const debounced = useDebounced(search);
  const recent = useRecentFoods();
  const mine = useMyFoods();
  const results = useFoodSearch(debounced);
  const add = useAddEntry();

  useOnChange(open, (o) => { if (o) { setPicked(null); setSearch(''); setSlot(slotId); setTab('recent'); } });

  const list = useMemo(() => {
    if (search.trim().length >= 2) return results.data ?? [];
    return tab === 'mine' ? mine.data ?? [] : recent.data ?? [];
  }, [search, tab, results.data, mine.data, recent.data]);
  const loading = search.trim().length >= 2 ? results.isLoading : tab === 'mine' ? mine.isLoading : recent.isLoading;

  const slotName = slots.find((s) => s.id === slot)?.name ?? 'meal';

  const confirm = async () => {
    if (!picked || !slot) return;
    await add.mutateAsync({ date, mealSlotId: slot, foodId: picked.id, quantity });
    toast.success(`${picked.name} added to ${slotName}`);
    setPicked(null);
    setSearch('');
  };

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        tall
        title={picked ? picked.name : `Add to ${slotName}`}
        footer={
          picked ? (
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <Button size="lg" variant="secondary" onClick={() => setPicked(null)} aria-label="Back to list"><ChevronLeft /></Button>
              <Button size="lg" loading={add.isPending} onClick={confirm}>Add to {slotName}</Button>
            </div>
          ) : undefined
        }
      >
        {picked ? (
          <div className="space-y-4">
            <QuantityEditor food={picked} quantity={quantity} onChange={setQuantity} />
            <Field label="Meal">
              <Select value={slot ?? ''} onChange={(e) => setSlot(Number(e.target.value))}>
                {slots.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </Field>
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 -mx-5 space-y-3 bg-surface px-5 pb-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search foods" className="pl-11" enterKeyHint="search" autoComplete="off" />
              </div>
              {search.trim().length < 2 && (
                <Segmented size="sm" value={tab} onChange={setTab} options={[{ value: 'recent', label: 'Recent' }, { value: 'mine', label: 'My foods' }]} />
              )}
            </div>
            {loading ? (
              <Loading />
            ) : !list.length ? (
              <Empty
                title={search.trim().length >= 2 ? 'No match' : tab === 'mine' ? 'No custom foods yet' : 'Nothing logged yet'}
                body={search.trim().length >= 2 ? 'Create it once with the values from the label.' : 'Search above — eggs, rice, paneer, whey…'}
                action={<Button variant="secondary" onClick={() => setCreating(true)}><Plus /> Create food</Button>}
              />
            ) : (
              <div className="space-y-0.5">
                {list.map((f) => (
                  <FoodRow key={f.id} food={f} onClick={() => { setPicked(f); setQuantity(1); }} />
                ))}
                <button onClick={() => setCreating(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 font-semibold text-primary">
                  <Plus className="h-5 w-5" /> Create a food
                </button>
              </div>
            )}
          </>
        )}
      </Sheet>
      <FoodFormSheet open={creating} onOpenChange={setCreating} initialName={search} onCreated={(f) => { setPicked(f); setQuantity(1); }} />
    </>
  );
}

export function EntrySheet({ entry, onClose }: { entry: MealFood | null; onClose: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const update = useUpdateEntry();
  const del = useDeleteEntry();
  useOnChange(entry, (e) => { if (e) setQuantity(e.quantity); });

  return (
    <Sheet
      open={!!entry}
      onOpenChange={(o) => !o && onClose()}
      title={entry?.food.name ?? ''}
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button size="lg" variant="danger" loading={del.isPending} onClick={async () => { if (entry) { await del.mutateAsync(entry.id); onClose(); } }}>
            Remove
          </Button>
          <Button size="lg" loading={update.isPending} onClick={async () => { if (entry) { await update.mutateAsync({ id: entry.id, quantity }); onClose(); } }}>
            Save
          </Button>
        </div>
      }
    >
      {entry && <QuantityEditor food={entry.food} quantity={quantity} onChange={setQuantity} />}
    </Sheet>
  );
}

export function FoodFormSheet({ open, onOpenChange, initialName, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; initialName?: string; onCreated?: (f: Food) => void }) {
  const create = useCreateFood();
  const [v, setV] = useState({ name: '', servingSize: '100', unit: 'g', calories: '', proteinG: '', carbsG: '', fatG: '' });
  useOnChange(open, (o) => { if (o) setV({ name: initialName ?? '', servingSize: '100', unit: 'g', calories: '', proteinG: '', carbsG: '', fatG: '' }); });

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((s) => ({ ...s, [k]: e.target.value }));
  const n = (x: string) => Number(x.replace(',', '.')) || 0;
  const macroKcal = Math.round(n(v.proteinG) * 4 + n(v.carbsG) * 4 + n(v.fatG) * 9);
  const valid = v.name.trim() && n(v.servingSize) > 0 && v.calories !== '';

  const save = async () => {
    const food = await create.mutateAsync({
      name: v.name.trim(), servingSize: n(v.servingSize), unit: v.unit,
      calories: Math.round(n(v.calories)), proteinG: n(v.proteinG), carbsG: n(v.carbsG), fatG: n(v.fatG),
    });
    toast.success(`${food.name} saved to My foods`);
    onCreated?.(food);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="New food"
      description="Copy the values from the nutrition label."
      footer={<Button size="lg" className="w-full" disabled={!valid} loading={create.isPending} onClick={save}>Save food</Button>}
    >
      <div className="space-y-4">
        <Field label="Name"><Input value={v.name} onChange={set('name')} placeholder="e.g. Homemade chicken curry" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Serving size"><Input inputMode="decimal" value={v.servingSize} onChange={set('servingSize')} /></Field>
          <Field label="Unit">
            <Select value={v.unit} onChange={set('unit')}>
              {['g', 'ml', 'piece', 'slice', 'cup', 'bowl', 'scoop', 'tbsp'].map((u) => <option key={u}>{u}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Calories (kcal)" hint={macroKcal > 0 && !v.calories ? `Macros add up to about ${macroKcal} kcal` : undefined}>
          <Input inputMode="decimal" value={v.calories} onChange={set('calories')} placeholder={macroKcal ? String(macroKcal) : ''} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Protein g"><Input inputMode="decimal" value={v.proteinG} onChange={set('proteinG')} /></Field>
          <Field label="Carbs g"><Input inputMode="decimal" value={v.carbsG} onChange={set('carbsG')} /></Field>
          <Field label="Fat g"><Input inputMode="decimal" value={v.fatG} onChange={set('fatG')} /></Field>
        </div>
      </div>
    </Sheet>
  );
}
