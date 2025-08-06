import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './contexts/CartContext';
import { useTokenExpiration } from './hooks/useTokenExpiration';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ResetPassword } from './components/auth/ResetPassword';
import { OTPVerification } from './components/auth/OTPVerification';
import { Dashboard } from './components/Dashboard';
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';
import ProductsManagement from './components/admin/products/ProductsManagement';
import UsersManagement from './components/admin/users/UsersManagement';
import OrdersManagement from './components/admin/orders/OrdersManagement';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getAuthService } from './services';
import AdminDashboard from './components/admin/dashboard/AdminDashboard';
import CategoryManagement from './components/admin/categories/CategoryManagement';
import CustomizationManagement from './components/admin/customizations/CustomizationManagement';
import CustomerProfilePage from './components/customer/ProfilePage';
import ProfilePage from './pages/ProfilePage';
import { Loading } from './components/Loading';
import CustomerDashboard from './components/customer/CustomerDashboard';
import ProductsPage from './components/customer/ProductsPage';
import CartPage from './components/customer/CartPage';
import CheckoutPage from './components/customer/CheckoutPage';
import OrdersPage from './components/customer/OrdersPage';
import SearchResultsPage from './components/customer/SearchResultsPage';
import WishlistPage from './components/customer/WishlistPage';
import NotificationsPage from './components/customer/NotificationsPage';
import ProductDetailPage from './components/customer/ProductDetailPage';
import OrderDetailPage from './components/customer/OrderDetailPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'admin' | 'customer' }> = ({
  children,
  requiredRole
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Auth Routes Component
const AuthRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot-password' | 'reset-password' | 'otp-verification'>('login');
  const [resetToken, setResetToken] = useState<string>('');
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [oauthHandled, setOauthHandled] = useState(false);

  useEffect(() => {
    // OAuth callback: lấy token từ URL nếu có
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const action = urlParams.get('action');
    if (token && action === 'oauth') {
      localStorage.setItem('access_token', token);
      window.history.replaceState({}, document.title, window.location.pathname); // Xoá query khỏi URL
      window.location.reload(); // Reload để AuthContext nhận token mới
    }
    // Check for URL parameters
    const tokenFromUrl = urlParams.get('token');
    const actionFromUrl = urlParams.get('action');
    const providerFromUrl = urlParams.get('provider');

    if (tokenFromUrl && actionFromUrl === 'reset') {
      setResetToken(tokenFromUrl);
      setCurrentView('reset-password');
    } else if (tokenFromUrl && actionFromUrl === 'oauth' && providerFromUrl && !oauthHandled) {
      setOauthHandled(true);
      setTimeout(() => {
        handleOAuthCallback(tokenFromUrl, providerFromUrl);
      }, 100);
    }
  }, [oauthHandled]);

  const handleOAuthCallback = async (token: string, provider: string) => {
    try {
      const authService = getAuthService();
      localStorage.setItem('access_token', token);
      const userProfile = await authService.getProfile();
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect based on role
      if (userProfile.role === 'admin') {
        window.location.replace('/admin');
      } else {
        window.location.replace('/dashboard');
      }
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      localStorage.removeItem('access_token');
    }
  };

  const handleRegisterSuccess = (email: string) => {
    setRegisteredEmail(email);
    setCurrentView('otp-verification');
  };

  const handleVerificationSuccess = () => {
    setCurrentView('login');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  // Redirect to appropriate dashboard if authenticated
  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  switch (currentView) {
    case 'register':
      return (
        <Register
          onSwitchToLogin={handleSwitchToLogin}
          onError={(message: string) => console.error('Register error:', message)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );

    case 'otp-verification':
      return (
        <OTPVerification
          email={registeredEmail}
          onBackToLogin={handleBackToLogin}
          onVerificationSuccess={handleVerificationSuccess}
        />
      );

    case 'forgot-password':
      return <ForgotPassword onBackToLogin={handleBackToLogin} />;

    case 'reset-password':
      return <ResetPassword token={resetToken} onBackToLogin={handleBackToLogin} />;

    default:
      return (
        <Login
          onSwitchToRegister={handleSwitchToRegister}
          onForgotPassword={handleForgotPassword}
        />
      );
  }
};

// Main App Component
const AppRoutes: React.FC = () => {
  // Use token expiration hook
  useTokenExpiration();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<AuthRoutes />} />
        <Route path="/register" element={<AuthRoutes />} />
        <Route path="/forgot-password" element={<AuthRoutes />} />
        <Route path="/reset-password" element={<AuthRoutes />} />
        <Route path="/otp-verification" element={<AuthRoutes />} />

        {/* Customer routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="customer">
              <ErrorBoundary>
                <CustomerLayout>
                  <CustomerDashboard />
                </CustomerLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute requiredRole="customer">
              <ErrorBoundary>
                <CustomerLayout>
                  <ProductsPage />
                </CustomerLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products/:slug"
          element={
            <ProtectedRoute requiredRole="customer">
              <ErrorBoundary>
                <CustomerLayout>
                  <ProductDetailPage />
                </CustomerLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute requiredRole="customer">
              <ErrorBoundary>
                <CustomerLayout>
                  <OrderDetailPage />
                </CustomerLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute requiredRole="customer">
              <ErrorBoundary>
                <CustomerLayout>
                  <CartPage />
                </CustomerLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute requiredRole="customer">
              <ErrorBoundary>
                <CustomerLayout>
                  <CheckoutPage />
                </CustomerLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute requiredRole="customer">
              <ErrorBoundary>
                <CustomerLayout>
                  <OrdersPage />
                </CustomerLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute requiredRole="customer">
              <ErrorBoundary>
                <CustomerLayout>
                  <OrdersPage />
                </CustomerLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute requiredRole="customer">
              <ErrorBoundary>
                <CustomerLayout>
                  <SearchResultsPage />
                </CustomerLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <ErrorBoundary>
                <AdminProvider>
                  <AdminLayout />
                </AdminProvider>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="customizations" element={<CustomizationManagement />} />
          <Route path="settings" element={<ProfilePage />} />
        </Route>

        {/* Customer profile route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRole="customer">
              <ErrorBoundary>
                <CustomerLayout>
                  <CustomerProfilePage />
                </CustomerLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute requiredRole="customer">
              <ErrorBoundary>
                <CustomerLayout>
                  <WishlistPage />
                </CustomerLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute requiredRole="customer">
              <ErrorBoundary>
                <CustomerLayout>
                  <NotificationsPage />
                </CustomerLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
