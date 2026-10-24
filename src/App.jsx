import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
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

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:slug" element={<CategoryListings />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/listings" element={<AdminListings />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/fees" element={<AdminFees />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
