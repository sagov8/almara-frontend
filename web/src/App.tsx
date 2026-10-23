import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthInstitutionalProvider } from './context/AuthInstitutionalContext';
import { RegistroInstitucionalPage } from './pages/RegistroInstitucionalPage';
import { LoginInstitucionalPage } from './pages/LoginInstitucionalPage';
import { DashboardInstitucionalPage } from './pages/DashboardInstitucionalPage';
import { ProtectedInstitutionalRoute } from './components/ProtectedInstitutionalRoute';

export const App: React.FC = () => {
  return (
    <AuthInstitutionalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/institutional/registro" element={<RegistroInstitucionalPage />} />
          <Route path="/institutional/login" element={<LoginInstitucionalPage />} />
          <Route
            path="/institutional/dashboard"
            element={
              <ProtectedInstitutionalRoute>
                <DashboardInstitucionalPage />
              </ProtectedInstitutionalRoute>
            }
          />
          <Route
            path="/institutional/planes/renovacion"
            element={
              <ProtectedInstitutionalRoute>
                <DashboardInstitucionalPage />
              </ProtectedInstitutionalRoute>
            }
          />
          <Route path="*" element={<Navigate to="/institutional/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthInstitutionalProvider>
  );
};

