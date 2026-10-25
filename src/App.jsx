import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CategoryListings from './pages/CategoryListings';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import AdminDashboard from './pages/admin/Dashboard';
import AdminListings from './pages/admin/Listings';
import AdminPayments from './pages/admin/Payments';
import AdminFees from './pages/admin/Fees';
import AdminUsers from './pages/admin/Users';

import ScrollToTop from './components/ScrollToTop';

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-neutral-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-burgundy" />
    </div>
  );

  // Not signed in — send to login
  if (!user) return <Navigate to="/login" replace />;

  // Signed in but not admin — show clear message
  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 gap-4">
      <p className="text-lg font-semibold text-neutral-700">Access denied</p>
      <p className="text-sm text-neutral-400">Your account does not have admin privileges.</p>
      <a href="/" className="text-sm text-brand-burgundy hover:underline">Back to home</a>
    </div>
  );

  return children;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public routes — wrapped in shared Layout */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/category/:slug" element={<Layout><CategoryListings /></Layout>} />
            <Route path="/listing/:id" element={<Layout><ListingDetail /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route path="/account" element={<Layout><Account /></Layout>} />

            {/* Admin routes — own layout, no public Layout wrapper */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/listings" element={<AdminRoute><AdminListings /></AdminRoute>} />
            <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
            <Route path="/admin/fees" element={<AdminRoute><AdminFees /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
