import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/components/common/Spinner';
import AlertMessage from '@/components/common/AlertMessage';
import DashboardLayout from '@/layouts/DashboardLayout';
import AddProduct from '@/pages/AddProduct';
import Dashboard from '@/pages/Dashboard';
import EditProduct from '@/pages/EditProduct';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Products from '@/pages/Products';
import Settings from '@/pages/Settings';
import Signup from '@/pages/Signup';
import { ROUTES } from '@/utils/constants';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner full />;
  return user ? children : <Navigate to={ROUTES.login} replace />;
}

function GuestRoute({ children }) {
  const { user, loading, authError } = useAuth();
  if (loading) return <Spinner full />;
  return user ? <Navigate to={ROUTES.dashboard} replace /> : (
    <>
      {authError && <div className="container pt-3"><AlertMessage message={authError} /></div>}
      {children}
    </>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<GuestRoute><Login /></GuestRoute>} />
      <Route path={ROUTES.signup} element={<GuestRoute><Signup /></GuestRoute>} />
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<AddProduct />} />
        <Route path="products/:id/edit" element={<EditProduct />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
