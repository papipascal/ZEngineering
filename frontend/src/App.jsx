import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [projectData, setProjectData] = useState(null);

  useEffect(() => {
    api.get("/project").then(setProjectData).catch(console.error);
  }, []);

  return (
    <Routes>
      <Route element={<Layout projectData={projectData} />}>
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
  );
}
