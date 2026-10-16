import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { GuestRoute } from '@/components/GuestRoute';

// Pagine caricate on demand: ognuna (con i suoi dataset, es. aeroporti o confini
// dell'atlante) finisce in un chunk separato invece che nel bundle iniziale.
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@/pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const TripDetailPage = lazy(() => import('@/pages/TripDetailPage').then((m) => ({ default: m.TripDetailPage })));
const TravelersPage = lazy(() => import('@/pages/TravelersPage').then((m) => ({ default: m.TravelersPage })));
const TravelerProfilePage = lazy(() =>
  import('@/pages/TravelerProfilePage').then((m) => ({ default: m.TravelerProfilePage }))
);
const AtlasPage = lazy(() => import('@/pages/AtlasPage').then((m) => ({ default: m.AtlasPage })));
const StatsPage = lazy(() => import('@/pages/StatsPage').then((m) => ({ default: m.StatsPage })));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <SignupPage />
              </GuestRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/trips/:tripId" element={<TripDetailPage />} />
            <Route path="/atlas" element={<AtlasPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/travelers" element={<TravelersPage />} />
            <Route path="/travelers/:userId" element={<TravelerProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}