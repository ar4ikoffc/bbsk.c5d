import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { DayPlanningPage } from '@/pages/DayPlanningPage'
import { MapViewPage } from '@/pages/MapViewPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { StaffPage } from '@/pages/StaffPage'
import { BuildingsPage } from '@/pages/BuildingsPage'
import { WorkTypesPage } from '@/pages/WorkTypesPage'
import { EventsPage } from '@/pages/EventsPage'
import { PgpGroupsPage } from '@/pages/PgpGroupsPage'
import { AlertsPage } from '@/pages/AlertsPage'
import { LoginPage } from '@/pages/LoginPage'
import { useAuthStore } from '@/store/authStore'
import { useAuthCheck } from '@/hooks/useAuth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const { isLoading, isError, error, isSuccess } = useAuthCheck()

  const isAuthError = isError && (error as { response?: { status: number } })?.response?.status === 401

  // No token in stored user = not authenticated
  const hasToken = !!user?.token

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated || !hasToken || isAuthError || !isSuccess) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const hasToken = !!user?.token

  // If user has valid token, redirect to home
  if (isAuthenticated && hasToken) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/day-planning" element={<DayPlanningPage />} />
        <Route path="/map" element={<MapViewPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/buildings" element={<BuildingsPage />} />
        <Route path="/work-types" element={<WorkTypesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/pgp-groups" element={<PgpGroupsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App