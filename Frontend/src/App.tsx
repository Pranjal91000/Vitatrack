import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, Link, Navigate, Outlet, RouterProvider, useRouteError } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/store/authStore';
import { applyTheme, useSettings } from '@/store/settingsStore';
import { useProfile } from '@/hooks/useProfile';
import { useRestAlarm } from '@/features/workout/useTimers';
import { Toaster } from '@/components/ui/toaster';
import { Loading } from '@/components/ui/primitives';
import AppShell from '@/components/layout/AppShell';
import { LoginPage, RegisterPage } from '@/features/auth/AuthPages';

const TodayPage = lazy(() => import('@/features/today/TodayPage'));
const WorkoutHomePage = lazy(() => import('@/features/workout/WorkoutHomePage'));
const ActiveWorkoutPage = lazy(() => import('@/features/workout/ActiveWorkoutPage'));
const RoutineEditorPage = lazy(() => import('@/features/workout/RoutineEditorPage'));
const HistoryPage = lazy(() => import('@/features/workout/HistoryPage'));
const WorkoutDetailPage = lazy(() => import('@/features/workout/WorkoutDetailPage'));
const ExerciseLibraryPage = lazy(() => import('@/features/workout/ExerciseLibraryPage'));
const ExerciseDetailPage = lazy(() => import('@/features/workout/ExerciseDetailPage'));
const NutritionPage = lazy(() => import('@/features/nutrition/NutritionPage'));
const BodyPage = lazy(() => import('@/features/body/BodyPage'));
const ProgressPage = lazy(() => import('@/features/progress/ProgressPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));

/** Authenticated area: global rest alarm + profile sync live here. */
function Protected() {
  const token = useAuthStore((s) => s.token);
  useProfile();
  useRestAlarm();
  if (!token) return <Navigate to="/login" replace />;
  return (
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  );
}

function RouteError() {
  const error = useRouteError() as { status?: number; statusText?: string; message?: string };
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl">{error?.status === 404 ? 'Page not found' : 'Something broke'}</h1>
      <p className="mt-2 max-w-sm text-muted">
        {error?.status === 404 ? 'That link doesn’t lead anywhere.' : 'Reload the app. A workout in progress is saved on this phone and will still be there.'}
      </p>
      <Link to="/" className="mt-6 font-semibold text-primary">Go to Today</Link>
    </div>
  );
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <Protected />,
    errorElement: <RouteError />,
    children: [
      { path: '/workout/active', element: <ActiveWorkoutPage /> },
      {
        element: <AppShell />,
        children: [
          { index: true, element: <TodayPage /> },
          { path: 'workout', element: <WorkoutHomePage /> },
          { path: 'workout/history', element: <HistoryPage /> },
          { path: 'workout/history/:id', element: <WorkoutDetailPage /> },
          { path: 'workout/routines/:id', element: <RoutineEditorPage /> },
          { path: 'workout/exercises', element: <ExerciseLibraryPage /> },
          { path: 'workout/exercises/:id', element: <ExerciseDetailPage /> },
          { path: 'nutrition', element: <NutritionPage /> },
          { path: 'body', element: <BodyPage /> },
          { path: 'progress', element: <ProgressPage /> },
          { path: 'settings', element: <SettingsPage /> },
          // Old routes from the previous UI
          { path: 'dashboard', element: <Navigate to="/" replace /> },
          { path: 'meals', element: <Navigate to="/nutrition" replace /> },
          { path: 'workouts', element: <Navigate to="/workout" replace /> },
          { path: 'weight', element: <Navigate to="/body" replace /> },
          { path: 'reports', element: <Navigate to="/progress" replace /> },
          { path: 'profile', element: <Navigate to="/settings" replace /> },
          { path: '*', element: <RouteError /> },
        ],
      },
    ],
  },
]);

export default function App() {
  const theme = useSettings((s) => s.theme);
  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}
