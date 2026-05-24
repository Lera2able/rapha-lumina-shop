import HomePage from './pages/HomePage';
import EnlightenedCollectionPage from './pages/EnlightenedCollectionPage';
import TeacherCollectionPage from './pages/TeacherCollectionPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterThankYouPage from './pages/RegisterThankYouPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AccountPage from './pages/AccountPage';
import AccountDashboard from './pages/AccountDashboard';
import AccountSettingsPage from './pages/AccountSettingsPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import FavoritesPage from './pages/FavoritesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SizeGuidePage from './pages/SizeGuidePage';
import ShippingPage from './pages/ShippingPage';
import ReturnsPage from './pages/ReturnsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import FAQPage from './pages/FAQPage';
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminRefundsPage from './pages/admin/AdminRefundsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCustomerDetailPage from './pages/admin/AdminCustomerDetailPage';
import AdminAccountPage from './pages/admin/AdminAccountPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />,
    public: true,
  },
  {
    name: 'Enlightened Collection',
    path: '/enlightened',
    element: <EnlightenedCollectionPage />,
    public: true,
  },
  {
    name: 'Teacher Collection',
    path: '/teacher',
    element: <TeacherCollectionPage />,
    public: true,
  },
  {
    name: 'Product Detail',
    path: '/product/:id',
    element: <ProductDetailPage />,
    public: true,
  },
  {
    name: 'Cart',
    path: '/cart',
    element: <CartPage />,
    public: true,
  },
  {
    name: 'Checkout',
    path: '/checkout',
    element: <CheckoutPage />,
    public: true,
  },
  {
    name: 'Payment Success',
    path: '/payment-success',
    element: <PaymentSuccessPage />,
    public: true,
  },
  {
    name: 'Payment Callback',
    path: '/payment/callback',
    element: <PaymentCallbackPage />,
    public: true,
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    public: true,
  },
  {
    name: 'Register',
    path: '/register',
    element: <RegisterPage />,
    public: true,
  },
  {
    name: 'Register Thank You',
    path: '/register/thank-you',
    element: <RegisterThankYouPage />,
    public: true,
  },
  {
    name: 'Forgot Password',
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    public: true,
  },
  {
    name: 'Reset Password',
    path: '/reset-password',
    element: <ResetPasswordPage />,
    public: true,
  },
  {
    name: 'About',
    path: '/about',
    element: <AboutPage />,
    public: true,
  },
  {
    name: 'Contact',
    path: '/contact',
    element: <ContactPage />,
    public: true,
  },
  {
    name: 'Size Guide',
    path: '/size-guide',
    element: <SizeGuidePage />,
    public: true,
  },
  {
    name: 'Shipping',
    path: '/shipping',
    element: <ShippingPage />,
    public: true,
  },
  {
    name: 'Returns',
    path: '/returns',
    element: <ReturnsPage />,
    public: true,
  },
  {
    name: 'Refund Policy',
    path: '/refund-policy',
    element: <RefundPolicyPage />,
    public: true,
  },
  {
    name: 'Privacy Policy',
    path: '/privacy',
    element: <PrivacyPolicyPage />,
    public: true,
  },
  {
    name: 'Terms and Conditions',
    path: '/terms',
    element: <TermsPage />,
    public: true,
  },
  {
    name: 'FAQ',
    path: '/faq',
    element: <FAQPage />,
    public: true,
  },
  {
    name: 'Account',
    path: '/account',
    element: <AccountPage />,
    public: false,
  },
  {
    name: 'Account Dashboard',
    path: '/account/dashboard',
    element: <AccountDashboard />,
    public: false,
  },
  {
    name: 'Account Settings',
    path: '/account/settings',
    element: <AccountSettingsPage />,
    public: false,
  },
  {
    name: 'Order History',
    path: '/account/orders',
    element: <OrderHistoryPage />,
    public: false,
  },
  {
    name: 'Favorites',
    path: '/account/favorites',
    element: <FavoritesPage />,
    public: false,
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <AdminLayout />,
    visible: false,
    public: false,
  },
  {
    name: 'Admin Dashboard',
    path: '/admin',
    element: <AdminDashboardPage />,
    visible: false,
    public: false,
  },
  {
    name: 'Admin Products',
    path: '/admin/products',
    element: <AdminProductsPage />,
    visible: false,
    public: false,
  },
  {
    name: 'Admin Add Product',
    path: '/admin/products/new',
    element: <AdminProductFormPage />,
    visible: false,
    public: false,
  },
  {
    name: 'Admin Edit Product',
    path: '/admin/products/:id/edit',
    element: <AdminProductFormPage />,
    visible: false,
    public: false,
  },
  {
    name: 'Admin Orders',
    path: '/admin/orders',
    element: <AdminOrdersPage />,
    visible: false,
    public: false,
  },
  {
    name: 'Admin Order Detail',
    path: '/admin/orders/:id',
    element: <AdminOrderDetailPage />,
    visible: false,
    public: false,
  },
  {
    name: 'Admin Refunds',
    path: '/admin/refunds',
    element: <AdminRefundsPage />,
    visible: false,
    public: false,
  },
  {
    name: 'Admin Customers',
    path: '/admin/customers',
    element: <AdminCustomersPage />,
    visible: false,
    public: false,
  },
  {
    name: 'Admin Customer Detail',
    path: '/admin/customers/:email',
    element: <AdminCustomerDetailPage />,
    visible: false,
    public: false,
  },
  {
    name: 'Admin Account',
    path: '/admin/account',
    element: <AdminAccountPage />,
    visible: false,
    public: false,
  },
];
