import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, Home, LineChart, Scale, UtensilsCrossed, Timer, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveWorkout } from '@/store/activeWorkoutStore';
import { useAuthStore } from '@/store/authStore';
import { useElapsed, useRestRemaining } from '@/features/workout/useTimers';
import { clock } from '@/lib/format';

const NAV = [
  { to: '/', label: 'Today', icon: Home, end: true },
  { to: '/workout', label: 'Workout', icon: Dumbbell },
  { to: '/nutrition', label: 'Food & Nutrition', icon: UtensilsCrossed },
  { to: '/body', label: 'Body Weight', icon: Scale },
  { to: '/progress', label: 'Analytics & Progress', icon: LineChart },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppShell() {
  return (
    <div className="min-h-dvh lg:flex bg-background">
      <SideRail />
      <div className="min-w-0 flex-1 flex flex-col">
        <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-nav lg:pb-16 pt-2 lg:pt-4 flex-1">
          <Outlet />
        </main>
      </div>
      <ActiveWorkoutBar />
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[var(--safe-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-2xl">
        {NAV.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('flex h-16 flex-col items-center justify-center gap-0.5 text-[12px] font-semibold transition-colors', isActive ? 'text-primary' : 'text-muted')
              }
            >
              <Icon className="h-6 w-6" strokeWidth={2} />
              {label.split(' ')[0]}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SideRail() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'VT';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 xl:w-72 shrink-0 flex-col border-r border-line bg-surface/80 px-4 py-6 backdrop-blur lg:flex">
      <div className="mb-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <img src="/favicon.svg" alt="" className="h-6 w-6" />
          </div>
          <div>
            <span className="font-display text-2xl font-bold tracking-tight block leading-none">VitaTrack</span>
            <span className="text-xs text-muted font-medium">Training & Nutrition</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group flex h-12 items-center gap-3.5 rounded-xl px-3.5 font-semibold text-[15px] transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted hover:bg-raised hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5 transition-transform group-hover:scale-110', isActive ? 'text-primary-foreground' : 'text-muted group-hover:text-foreground')} />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile bottom bar */}
      <div className="mt-auto pt-4 border-t border-line">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-raised/50 p-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground leading-tight">
                {user?.name || 'Athlete'}
              </span>
              <span className="block truncate text-xs text-muted">
                {user?.email || 'Logged in'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-destructive/15 hover:text-destructive transition-colors shrink-0"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

/** Persistent "workout in progress" strip so the session is one tap away from any tab. */
function ActiveWorkoutBar() {
  const active = useActiveWorkout((s) => s.active);
  const location = useLocation();
  const navigate = useNavigate();
  const elapsed = useElapsed(active?.startedAt);
  const rest = useRestRemaining();

  if (!active || location.pathname.startsWith('/workout/active')) return null;

  return (
    <button
      onClick={() => navigate('/workout/active')}
      className="fixed inset-x-3 bottom-[calc(4.5rem+var(--safe-bottom))] z-40 mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-left text-primary-foreground shadow-lg animate-pop-in lg:bottom-6 lg:left-72 xl:left-80"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{active.editingId ? 'Editing workout' : active.name}</span>
        <span className="num text-sm opacity-85">{clock(elapsed)} elapsed</span>
      </span>
      {rest != null && (
        <span className="num flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-sm font-semibold">
          <Timer className="h-4 w-4" /> {clock(rest)}
        </span>
      )}
      <span className="text-sm font-semibold">Resume</span>
    </button>
  );
}
