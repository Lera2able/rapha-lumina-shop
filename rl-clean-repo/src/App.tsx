import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Header } from '@/components/layouts/Header';
import { Footer } from '@/components/layouts/Footer';
import { NewsletterPopup } from '@/components/common/NewsletterPopup';
import AccountPage from '@/pages/AccountPage';
import AccountDashboard from '@/pages/AccountDashboard';
import AccountSettingsPage from '@/pages/AccountSettingsPage';
import OrderHistoryPage from '@/pages/OrderHistoryPage';
import FavoritesPage from '@/pages/FavoritesPage';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminProductFormPage from '@/pages/admin/AdminProductFormPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from '@/pages/admin/AdminOrderDetailPage';
import AdminRefundsPage from '@/pages/admin/AdminRefundsPage';

import { routes } from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <IntersectObserver />
          <Routes>
            {/* Admin Routes - No Header/Footer */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/:id/edit" element={<AdminProductFormPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="refunds" element={<AdminRefundsPage />} />
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
                        element={route.element}
                      />
                    ))}
                    <Route path="/account" element={<AccountPage />}>
                      <Route index element={<AccountDashboard />} />
                      <Route path="orders" element={<OrderHistoryPage />} />
                      <Route path="favorites" element={<FavoritesPage />} />
                      <Route path="settings" element={<AccountSettingsPage />} />
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
