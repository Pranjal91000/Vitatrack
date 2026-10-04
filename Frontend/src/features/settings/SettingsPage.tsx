import { useState } from 'react';
import { useOnChange } from '@/lib/hooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ConfirmSheet } from '@/components/ui/sheet';
import { ErrorState, Field, Input, Loading, SectionTitle, Segmented, Select } from '@/components/ui/primitives';
import { profileToRequest, useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/authStore';
import { useActiveWorkout } from '@/store/activeWorkoutStore';
import { applyTheme, useSettings, type Theme } from '@/store/settingsStore';
import { ACTIVITY_LEVELS, REST_PRESETS } from '@/lib/constants';
import { clock, fromKg, num, toKg } from '@/lib/format';
import { errorMessage } from '@/lib/api';
import type { Sex, WeightUnit } from '@/types/api';

const toNum = (s: string) => (s.trim() === '' ? null : Number(s.replace(',', '.')));

export default function SettingsPage() {
  const [params] = useSearchParams();
  const welcome = params.get('welcome') === '1';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: p, isLoading, error, refetch } = useProfile();
  const update = useUpdateProfile();
  const { theme, setTheme, restSound, setRestSound } = useSettings();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const [f, setF] = useState({
    name: '', sex: '' as Sex | '', age: '', heightCm: '', weight: '', activity: '1.55', goalWeight: '',
    customGoals: false, calories: '', protein: '', carbs: '', fat: '', unit: 'kg' as WeightUnit, rest: 90,
  });

  // Initialise once per loaded profile; background refetches must not wipe edits in progress.
  useOnChange(p?.id, () => {
    if (!p) return;
    setF({
      name: p.name, sex: p.sex ?? '', age: p.age?.toString() ?? '', heightCm: p.heightCm?.toString() ?? '',
      weight: p.weightKg != null ? String(fromKg(p.weightKg, p.weightUnit)) : '',
      activity: String(p.activityFactor ?? 1.55),
      goalWeight: p.weightGoalKg != null ? String(fromKg(p.weightGoalKg, p.weightUnit)) : '',
      customGoals: p.calorieGoal != null || p.proteinGoalG != null,
      calories: String(p.calorieGoal ?? p.effectiveGoals.calories),
      protein: String(p.proteinGoalG ?? p.effectiveGoals.proteinG),
      carbs: String(p.carbsGoalG ?? p.effectiveGoals.carbsG),
      fat: String(p.fatGoalG ?? p.effectiveGoals.fatG),
      unit: p.weightUnit, rest: p.defaultRestSeconds,
    });
  });

  if (isLoading) return <Loading />;
  if (error || !p) return <><PageHeader back title="Settings" /><ErrorState message={errorMessage(error)} onRetry={() => refetch()} /></>;

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const changeUnit = (u: WeightUnit) => {
    // Convert the typed numbers so they keep meaning the same body weight.
    const conv = (s: string) => { const n = toNum(s); return n == null ? '' : String(fromKg(toKg(n, f.unit), u)); };
    setF((s) => ({ ...s, unit: u, weight: conv(s.weight), goalWeight: conv(s.goalWeight) }));
  };

  const save = async () => {
    const w = toNum(f.weight);
    const gw = toNum(f.goalWeight);
    await update.mutateAsync(
      profileToRequest(p, {
        name: f.name.trim() || p.name,
        sex: f.sex || null,
        age: toNum(f.age),
        heightCm: toNum(f.heightCm),
        weightKg: w != null ? toKg(w, f.unit) : null,
        weightGoalKg: gw != null ? toKg(gw, f.unit) : null,
        activityFactor: Number(f.activity),
        calorieGoal: f.customGoals ? toNum(f.calories) : null,
        proteinGoalG: f.customGoals ? toNum(f.protein) : null,
        carbsGoalG: f.customGoals ? toNum(f.carbs) : null,
        fatGoalG: f.customGoals ? toNum(f.fat) : null,
        weightUnit: f.unit,
        defaultRestSeconds: f.rest,
      }),
    );
    if (welcome) navigate('/', { replace: true });
  };

  const logout = () => {
    useActiveWorkout.getState().discard();
    useAuthStore.getState().logout();
    qc.clear();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <PageHeader back={!welcome} title={welcome ? 'Set up your profile' : 'Settings'} actions={<Button size="sm" loading={update.isPending} onClick={save}>Save</Button>} />

      {welcome && (
        <p className="card mb-2 p-4 text-[15px]">
          A few numbers let VitaTrack suggest calorie and protein targets. You can skip anything and change it later.
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Profile & Nutrition Goals */}
        <div className="space-y-6">
          <div>
            <SectionTitle>Profile & Biometrics</SectionTitle>
            <div className="card space-y-4 p-5 shadow-sm">
              <Field label="Name"><Input value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
              <div>
                <span className="label">Sex (for the calorie estimate)</span>
                <Segmented value={f.sex} onChange={(v) => set('sex', v)} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: '', label: 'Skip' }]} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Age"><Input inputMode="numeric" value={f.age} onChange={(e) => set('age', e.target.value)} /></Field>
                <Field label="Height cm"><Input inputMode="decimal" value={f.heightCm} onChange={(e) => set('heightCm', e.target.value)} /></Field>
                <Field label={`Weight ${f.unit}`}><Input inputMode="decimal" value={f.weight} onChange={(e) => set('weight', e.target.value)} /></Field>
              </div>
              <Field label="Activity level">
                <Select value={f.activity} onChange={(e) => set('activity', e.target.value)}>
                  {ACTIVITY_LEVELS.map((a) => <option key={a.value} value={String(a.value)}>{a.label}</option>)}
                </Select>
              </Field>
              <Field label={`Goal weight ${f.unit} (optional)`}><Input inputMode="decimal" value={f.goalWeight} onChange={(e) => set('goalWeight', e.target.value)} /></Field>
            </div>
          </div>

          <div>
            <SectionTitle>Daily Nutritional Targets</SectionTitle>
            <div className="card space-y-4 p-5 shadow-sm">
              <Segmented
                value={f.customGoals ? 'custom' : 'auto'}
                onChange={(v) => set('customGoals', v === 'custom')}
                options={[{ value: 'auto', label: 'Recommended' }, { value: 'custom', label: 'Custom' }]}
              />
              {!f.customGoals ? (
                <div className="rounded-xl bg-raised/60 p-4 text-[15px]">
                  <p className="num">
                    <span className="font-display text-2xl font-semibold">{num(p.effectiveGoals.calories, 0)}</span> kcal ·{' '}
                    P {p.effectiveGoals.proteinG} g · C {p.effectiveGoals.carbsG} g · F {p.effectiveGoals.fatG} g
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {p.tdee
                      ? `Maintenance estimate from your profile (BMR ${num(p.bmr, 0)} kcal × activity). Protein 1.8 g per kg body weight.`
                      : 'Add age, height and weight above for a personal estimate. Showing a 2000 kcal default.'}
                  </p>
                </div>
              ) : (
                <>
                  <Field label="Calories" hint={p.tdee ? `Maintenance is about ${p.tdee} kcal. Cut: −300 to −500. Lean bulk: +200 to +300.` : undefined}>
                    <Input inputMode="numeric" value={f.calories} onChange={(e) => set('calories', e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Protein g"><Input inputMode="numeric" value={f.protein} onChange={(e) => set('protein', e.target.value)} /></Field>
                    <Field label="Carbs g"><Input inputMode="numeric" value={f.carbs} onChange={(e) => set('carbs', e.target.value)} /></Field>
                    <Field label="Fat g"><Input inputMode="numeric" value={f.fat} onChange={(e) => set('fat', e.target.value)} /></Field>
                  </div>
                  <p className="num text-sm text-muted">
                    Macros add up to {num((toNum(f.protein) ?? 0) * 4 + (toNum(f.carbs) ?? 0) * 4 + (toNum(f.fat) ?? 0) * 9, 0)} kcal.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Preferences, Appearance & Account */}
        <div className="space-y-6">
          <div>
            <SectionTitle>Workout Preferences</SectionTitle>
            <div className="card space-y-4 p-5 shadow-sm">
              <div>
                <span className="label">Weight unit</span>
                <Segmented value={f.unit} onChange={changeUnit} options={[{ value: 'kg', label: 'Kilograms' }, { value: 'lb', label: 'Pounds' }]} />
              </div>
              <Field label="Default rest timer">
                <Select value={f.rest} onChange={(e) => set('rest', Number(e.target.value))}>
                  <option value={0}>Off</option>
                  {REST_PRESETS.map((s) => <option key={s} value={s}>{clock(s)}</option>)}
                </Select>
              </Field>
              <label className="flex items-center justify-between gap-3 pt-1">
                <span>
                  <span className="block font-semibold">Sound when rest ends</span>
                  <span className="text-sm text-muted">Audio beep and haptic feedback.</span>
                </span>
                <input type="checkbox" className="h-6 w-6 accent-[hsl(var(--blue))] rounded cursor-pointer" checked={restSound} onChange={(e) => setRestSound(e.target.checked)} />
              </label>
            </div>
          </div>

          <div>
            <SectionTitle>Appearance & Theme</SectionTitle>
            <div className="card p-5 shadow-sm">
              <Segmented
                value={theme}
                onChange={(t: Theme) => { setTheme(t); applyTheme(t); }}
                options={[{ value: 'dark', label: 'Dark Mode' }, { value: 'light', label: 'Light Mode' }, { value: 'system', label: 'Auto (System)' }]}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button size="lg" className="w-full font-bold shadow-md" loading={update.isPending} onClick={save}>
              Save all changes
            </Button>
            <div className="card p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted block">Signed in as</span>
                <span className="text-sm font-semibold text-foreground">{p.email}</span>
              </div>
              <Button variant="danger" size="sm" onClick={() => setConfirmLogout(true)}>
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmSheet
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Log out?"
        description="Any workout in progress on this phone will be discarded."
        confirmLabel="Log out"
        destructive
        onConfirm={logout}
      />
    </>
  );
}
