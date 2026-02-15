import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProjectProvider } from './auth/ProjectContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ProjectSelectionPage from './pages/ProjectSelectionPage';
import ProjectDashboardPage from './pages/ProjectDashboardPage';
import EquipmentListPage from './pages/EquipmentListPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import DiscussionListPage from './pages/DiscussionListPage';
import DiscussionDetailPage from './pages/DiscussionDetailPage';
import MyTasksPage from './pages/MyTasksPage';
import ChangeRequestListPage from './pages/ChangeRequestListPage';
import VendorListPage from './pages/VendorListPage';
import DocumentsPage from './pages/DocumentsPage';
import ProjectDocumentRegisterPage from './pages/ProjectDocumentRegisterPage';
import TransmittalListPage from './pages/TransmittalListPage';
import TransmittalComposePage from './pages/TransmittalComposePage';
import TransmittalDetailPage from './pages/TransmittalDetailPage';
import IncomingEmailListPage from './pages/IncomingEmailListPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/select-project"
              element={
                <ProtectedRoute>
                  <ProjectSelectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<ProjectDashboardPage />} />
              <Route path="/equipment" element={<EquipmentListPage />} />
              <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
              <Route path="/discussions" element={<DiscussionListPage />} />
              <Route path="/discussions/:id" element={<DiscussionDetailPage />} />
              <Route path="/tasks" element={<MyTasksPage />} />
              <Route path="/change-requests" element={<ChangeRequestListPage />} />
              <Route path="/vendors" element={<VendorListPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/document-register" element={<ProjectDocumentRegisterPage />} />
              <Route path="/transmittals" element={<TransmittalListPage />} />
              <Route path="/transmittals/new" element={<TransmittalComposePage />} />
              <Route path="/transmittals/:id" element={<TransmittalDetailPage />} />
              <Route path="/incoming-emails" element={<IncomingEmailListPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
