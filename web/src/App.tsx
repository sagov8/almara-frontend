import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthInstitutionalProvider } from './context/AuthInstitutionalContext';
import { RegistroInstitucionalPage } from './pages/RegistroInstitucionalPage';
import { LoginInstitucionalPage } from './pages/LoginInstitucionalPage';
import { DashboardInstitucionalPage } from './pages/DashboardInstitucionalPage';
import { CatalogoPlanesPage } from './pages/CatalogoPlanesPage';
import { MiSuscripcionPage } from './pages/MiSuscripcionPage';
import { CheckoutSuscripcionPage } from './pages/CheckoutSuscripcionPage';
import { ProtectedInstitutionalRoute } from './components/ProtectedInstitutionalRoute';

export const App: React.FC = () => {
  return (
    <AuthInstitutionalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/institutional/registro" element={<RegistroInstitucionalPage />} />
          <Route path="/institutional/login" element={<LoginInstitucionalPage />} />
          <Route path="/institutional/planes" element={<CatalogoPlanesPage />} />
          <Route path="/institutional/planes/renovacion" element={<CatalogoPlanesPage />} />
          <Route
            path="/institutional/checkout"
            element={
              <ProtectedInstitutionalRoute>
                <CheckoutSuscripcionPage />
              </ProtectedInstitutionalRoute>
            }
          />
          <Route
            path="/institutional/mi-suscripcion"
            element={
              <ProtectedInstitutionalRoute>
                <MiSuscripcionPage />
              </ProtectedInstitutionalRoute>
            }
          />
          <Route
            path="/institutional/dashboard"
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

