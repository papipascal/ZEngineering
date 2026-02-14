import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EquipmentListPage from './pages/EquipmentListPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import DiscussionListPage from './pages/DiscussionListPage';
import DiscussionDetailPage from './pages/DiscussionDetailPage';
import MyTasksPage from './pages/MyTasksPage';
import ChangeRequestListPage from './pages/ChangeRequestListPage';
import VendorListPage from './pages/VendorListPage';
import DocumentsPage from './pages/DocumentsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/equipment" element={<EquipmentListPage />} />
            <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
            <Route path="/discussions" element={<DiscussionListPage />} />
            <Route path="/discussions/:id" element={<DiscussionDetailPage />} />
            <Route path="/tasks" element={<MyTasksPage />} />
            <Route path="/change-requests" element={<ChangeRequestListPage />} />
            <Route path="/vendors" element={<VendorListPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
