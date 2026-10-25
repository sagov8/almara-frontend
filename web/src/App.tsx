import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthInstitutionalProvider } from './context/AuthInstitutionalContext';
import { AuthAdminProvider } from './context/AuthAdminContext';
import { RegistroInstitucionalPage } from './pages/RegistroInstitucionalPage';
import { LoginInstitucionalPage } from './pages/LoginInstitucionalPage';
import { DashboardInstitucionalPage } from './pages/DashboardInstitucionalPage';
import { CatalogoPlanesPage } from './pages/CatalogoPlanesPage';
import { MiSuscripcionPage } from './pages/MiSuscripcionPage';
import { CheckoutSuscripcionPage } from './pages/CheckoutSuscripcionPage';
import { ProtectedInstitutionalRoute } from './components/ProtectedInstitutionalRoute';
import { LoginAdminPage } from './pages/LoginAdminPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { GestionCatalogoEmocionesPage } from './pages/GestionCatalogoEmocionesPage';
import { GestionUmbralesMapaPage } from './pages/GestionUmbralesMapaPage';
import { GestionZonasH3Page } from './pages/GestionZonasH3Page';
import { GestionUsuariosInstitucionalesPage } from './pages/GestionUsuariosInstitucionalesPage';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';

export const App: React.FC = () => {
  return (
    <AuthAdminProvider>
      <AuthInstitutionalProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas del Módulo de Administración */}
            <Route path="/admin/login" element={<LoginAdminPage />} />
            <Route path="/admin" element={<ProtectedAdminRoute />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="emociones" element={<GestionCatalogoEmocionesPage />} />
              <Route path="umbrales" element={<GestionUmbralesMapaPage />} />
              <Route path="zonas-h3" element={<GestionZonasH3Page />} />
              <Route path="instituciones" element={<GestionUsuariosInstitucionalesPage />} />
            </Route>

            {/* Rutas del Módulo Cliente Institucional y Suscripciones SaaS */}
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

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthInstitutionalProvider>
    </AuthAdminProvider>
  );
};
