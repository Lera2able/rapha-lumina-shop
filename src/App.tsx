import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Header } from '@/components/layouts/Header';
import { Footer } from '@/components/layouts/Footer';
import { NewsletterPopup } from '@/components/common/NewsletterPopup';
import { routes } from './routes';

const AccountPage = lazy(() => import('@/pages/AccountPage'));
const AccountDashboard = lazy(() => import('@/pages/AccountDashboard'));
const AccountSettingsPage = lazy(() => import('@/pages/AccountSettingsPage'));
const OrderHistoryPage = lazy(() => import('@/pages/OrderHistoryPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const AdminLayout = lazy(() => import('@/components/layouts/AdminLayout'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('@/pages/admin/AdminProductFormPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/AdminOrderDetailPage'));
const AdminRefundsPage = lazy(() => import('@/pages/admin/AdminRefundsPage'));
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'));
const AdminCustomerDetailPage = lazy(() => import('@/pages/admin/AdminCustomerDetailPage'));
const AdminSubscribersPage = lazy(() => import('@/pages/admin/AdminSubscribersPage'));
const AdminAccountPage = lazy(() => import('@/pages/admin/AdminAccountPage'));

const RouteLoading = () => (
  <div className="flex min-h-[40vh] items-center justify-center px-6">
    <div className="text-center space-y-2">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      <p className="text-sm text-muted-foreground">Loading page…</p>
    </div>
  </div>
);

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<RouteLoading />}>{element}</Suspense>
);

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <IntersectObserver />
          <Routes>
            {/* Admin Routes - No Header/Footer */}
            <Route path="/admin" element={withSuspense(<AdminLayout />)}>
              <Route index element={withSuspense(<AdminDashboardPage />)} />
              <Route path="products" element={withSuspense(<AdminProductsPage />)} />
              <Route path="products/new" element={withSuspense(<AdminProductFormPage />)} />
              <Route path="products/:id/edit" element={withSuspense(<AdminProductFormPage />)} />
              <Route path="orders" element={withSuspense(<AdminOrdersPage />)} />
              <Route path="orders/:id" element={withSuspense(<AdminOrderDetailPage />)} />
              <Route path="refunds" element={withSuspense(<AdminRefundsPage />)} />
              <Route path="customers" element={withSuspense(<AdminCustomersPage />)} />
              <Route path="customers/:email" element={withSuspense(<AdminCustomerDetailPage />)} />
              <Route path="subscribers" element={withSuspense(<AdminSubscribersPage />)} />
              <Route path="account" element={withSuspense(<AdminAccountPage />)} />
            </Route>

            {/* Public Routes - With Header/Footer */}
            <Route path="*" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    {routes.filter(route => !route.path.startsWith('/admin')).map((route, index) => (
                      <Route
                        key={index}
                        path={route.path}
                        element={withSuspense(route.element)}
                      />
                    ))}
                    <Route path="/account" element={withSuspense(<AccountPage />)}>
                      <Route index element={withSuspense(<AccountDashboard />)} />
                      <Route path="orders" element={withSuspense(<OrderHistoryPage />)} />
                      <Route path="favorites" element={withSuspense(<FavoritesPage />)} />
                      <Route path="settings" element={withSuspense(<AccountSettingsPage />)} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
          <Toaster />
          <NewsletterPopup />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
