
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from './lib/queryClient';
import Layout from './app/layout';
import { useAuthStore } from './store/auth';

import { Dashboard } from './pages/Dashboard';
import { Meals } from './pages/Meals';
import { Workouts } from './pages/Workouts';
import { Reports } from './pages/Reports';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { WeightTracker } from './pages/WeightTracker';
import { ErrorPage } from './pages/ErrorPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    errorElement: <ErrorPage />,
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'meals',
        element: <Meals />,
      },
      {
        path: 'workouts',
        element: <Workouts />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'weight',
        element: <WeightTracker />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
