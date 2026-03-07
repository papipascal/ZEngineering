import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { api } from './hooks/useApi.js';

import DashboardPage    from './pages/DashboardPage.jsx';
import PlanningPage     from './pages/PlanningPage.jsx';
import TasksPage        from './pages/TasksPage.jsx';
import RisksPage        from './pages/RisksPage.jsx';
import FinancePage      from './pages/FinancePage.jsx';
import DocumentsPage    from './pages/DocumentsPage.jsx';
import TransmittalsPage from './pages/TransmittalsPage.jsx';
import EmailsPage       from './pages/EmailsPage.jsx';
import DiscussionsPage  from './pages/DiscussionsPage.jsx';
import EquipmentPage    from './pages/EquipmentPage.jsx';
import QAPage           from './pages/QAPage.jsx';
import DeployPage       from './pages/DeployPage.jsx';
import OrganizationPage from './pages/OrganizationPage.jsx';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function parseV3Context() {
  try {
    const params = new URLSearchParams(window.location.search);
    const token   = params.get('token');
    const user    = params.get('user')    ? JSON.parse(params.get('user'))    : null;
    const project = params.get('project') ? JSON.parse(params.get('project')) : null;
    if (token && user && project) {
      window.history.replaceState({}, '', window.location.pathname);
      return { token, user, project, fromV3: true };
    }
  } catch (_) {}
  return null;
}

export default function App() {
  const [projectData, setProjectData] = useState(null);
  const [authCtx, setAuthCtx] = useState(null);

  useEffect(() => {
    const v3ctx = parseV3Context();
    setAuthCtx(v3ctx);
    api.get("/project").then(setProjectData).catch(console.error);
  }, []);

  const v3Url = import.meta.env.VITE_V3_URL || 'http://localhost:3000';

  return (
    <AuthContext.Provider value={authCtx}>
      <Routes>
        <Route element={<Layout projectData={projectData} v3Url={v3Url} />}>
          <Route path="/"             element={<DashboardPage />} />
          <Route path="/planning"     element={<PlanningPage />} />
          <Route path="/tasks"        element={<TasksPage />} />
          <Route path="/risks"        element={<RisksPage />} />
          <Route path="/finance"      element={<FinancePage />} />
          <Route path="/documents"    element={<DocumentsPage />} />
          <Route path="/transmittals" element={<TransmittalsPage />} />
          <Route path="/emails"       element={<EmailsPage />} />
          <Route path="/discussions"  element={<DiscussionsPage />} />
          <Route path="/equipment"    element={<EquipmentPage />} />
          <Route path="/qa"           element={<QAPage />} />
          <Route path="/deploy"       element={<DeployPage />} />
          <Route path="/organization" element={<OrganizationPage />} />
          <Route path="*"             element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </AuthContext.Provider>
  );
}
