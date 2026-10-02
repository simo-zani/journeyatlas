import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { GuestRoute } from '@/components/GuestRoute';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TripDetailPage } from '@/pages/TripDetailPage';
import { TravelersPage } from '@/pages/TravelersPage';
import { TravelerProfilePage } from '@/pages/TravelerProfilePage';

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="/travelers" element={<TravelersPage />} />
          <Route path="/travelers/:userId" element={<TravelerProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}