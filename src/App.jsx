import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CompareProvider } from '@/compare/CompareContext';
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import Lab from '@/pages/Lab';
import ComparePage from '@/pages/ComparePage';
import { AnimatePresence } from 'framer-motion';

const AppInner = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <CompareProvider>
    <AppInner />
  </CompareProvider>
);

export default App;