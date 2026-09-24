import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import AppShell from './components/AppShell';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/LoginScreen';
import ResourcePage from './components/ResourcePage';
import TicketPage from './components/TicketPage';
import ProfilePage from './pages/ProfilePage';
import { resourceConfigs } from './appConfig';

function LayoutWrapper({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const activePage = location.pathname.substring(1) || 'dashboard';

  return (
    <AppShell
      user={user}
      activePage={activePage}
      onNavigate={(page) => navigate(`/${page}`)}
      onLogout={logout}
    >
      {children}
    </AppShell>
  );
}

function AppRoutes() {
  const { user, login } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          user ? <Navigate to="/" replace /> : <LoginScreen onAuthenticated={login} />
        }
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['employee', 'technician', 'manager', 'admin']} />}>
        <Route
          path="/"
          element={
            <LayoutWrapper>
              <Dashboard />
            </LayoutWrapper>
          }
        />
        <Route
          path="/tickets"
          element={
            <LayoutWrapper>
              <TicketPage />
            </LayoutWrapper>
          }
        />
        <Route
          path="/profile"
          element={
            <LayoutWrapper>
              <ProfilePage />
            </LayoutWrapper>
          }
        />
        <Route
          path="/categories"
          element={
            <LayoutWrapper>
              <ResourcePage config={resourceConfigs.categories} />
            </LayoutWrapper>
          }
        />
        <Route
          path="/priorities"
          element={
            <LayoutWrapper>
              <ResourcePage config={resourceConfigs.priorities} />
            </LayoutWrapper>
          }
        />
        <Route
          path="/sla-policies"
          element={
            <LayoutWrapper>
              <ResourcePage config={resourceConfigs.slaPolicies} />
            </LayoutWrapper>
          }
        />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}