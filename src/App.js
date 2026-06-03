import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Temporary pages using Dashboard
const StudentsPage = () => <DashboardPage />;
const CompaniesPage = () => <DashboardPage />;
const DrivesPage = () => <DashboardPage />;
const ApplicationsPage = () => <DashboardPage />;
const InterviewsPage = () => <DashboardPage />;
const ProfilePage = () => <DashboardPage />;

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Students */}
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <StudentsPage />
              </ProtectedRoute>
            }
          />

          {/* Companies */}
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <CompaniesPage />
              </ProtectedRoute>
            }
          />

          {/* Drives */}
          <Route
            path="/drives"
            element={
              <ProtectedRoute>
                <DrivesPage />
              </ProtectedRoute>
            }
          />

          {/* Applications */}
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <ApplicationsPage />
              </ProtectedRoute>
            }
          />

          {/* Interviews */}
          <Route
            path="/interviews"
            element={
              <ProtectedRoute>
                <InterviewsPage />
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Unknown Routes */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />

        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
