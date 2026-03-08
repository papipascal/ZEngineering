import { Component, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProjectProvider } from './auth/ProjectContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#1a1a2e', color: '#ff6b6b', minHeight: '100vh' }}>
          <h2>Erreur rendue</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#ffd93d' }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: '#aaa' }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
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
import ProjectSetupPage from './pages/ProjectSetupPage';
import SearchPage from './pages/SearchPage';
import ContractRequirementsPage from './pages/ContractRequirementsPage';
import ContractChangeLogPage from './pages/ContractChangeLogPage';
import AgoReportPage from './pages/AgoReportPage';
import OrganizationPage from './pages/OrganizationPage';
import AuditPage from './pages/AuditPage';
import ProfilePage from './pages/ProfilePage';
import DocumentProposalsPage from './pages/DocumentProposalsPage';
import ConnectionsPage from './pages/ConnectionsPage';
import SparePartsPage from './pages/SparePartsPage';
import VersionSelectPage from './pages/VersionSelectPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <ErrorBoundary>
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
              path="/version-select"
              element={
                <ProtectedRoute>
                  <VersionSelectPage />
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
              <Route path="/search" element={<SearchPage />} />
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
              <Route path="/contract-requirements" element={<ContractRequirementsPage />} />
              <Route path="/contract-change-log" element={<ContractChangeLogPage />} />
              <Route path="/ago-report" element={<AgoReportPage />} />
              <Route path="/organization" element={<OrganizationPage />} />
              <Route path="/audit" element={<AuditPage />} />
              <Route path="/project-setup" element={<ProjectSetupPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/document-proposals" element={<DocumentProposalsPage />} />
              <Route path="/connections" element={<ConnectionsPage />} />
              <Route path="/spare-parts" element={<SparePartsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
