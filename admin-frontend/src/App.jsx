import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManageItems from './pages/ManageItems';
import ItemDetail from './pages/ItemDetail';
import ClaimRequests from './pages/ClaimRequests';
import ManageUsers from './pages/ManageUsers';
import ActivityLogs from './pages/ActivityLogs';

function Protected({ children }) {
  const { admin } = useAdminAuth();
  return admin ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { admin } = useAdminAuth();
  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<Protected><AdminLayout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="items" element={<ManageItems />} />
        <Route path="items/:id" element={<ItemDetail />} />
        <Route path="claims" element={<ClaimRequests />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="logs" element={<ActivityLogs />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
