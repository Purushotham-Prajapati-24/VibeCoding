import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CompareProvider } from '@/compare/CompareContext';
import { TutorProvider } from '@/tutor/TutorContext';
import { ScenarioProvider } from '@/context/StructuredScenarioContext';
import { SoundProvider } from '@/components/Audio/SoundManager.jsx';
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import Lab from '@/pages/Lab';
import ComparePage from '@/pages/ComparePage';
import ResearchDashboard from '@/research/ResearchDashboard';
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
        <Route path="/research" element={<ResearchDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

import NewtonAI from '@/components/AI/NewtonAI';

import { LearningEngineProvider } from '@/context/LearningEngineContext';


const App = () => (
  <LearningEngineProvider>
    <NewtonAI />
    <AppInner />
  </LearningEngineProvider>
);

export default App;