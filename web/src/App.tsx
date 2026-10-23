import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RegistroInstitucionalPage } from './pages/RegistroInstitucionalPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/institutional/registro" element={<RegistroInstitucionalPage />} />
        <Route path="*" element={<Navigate to="/institutional/registro" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
