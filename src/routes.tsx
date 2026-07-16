import { lazy, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/HomePage'));
const EnlightenedCollectionPage = lazy(() => import('./pages/EnlightenedCollectionPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentCallbackPage = lazy(() => import('./pages/PaymentCallbackPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const RegisterThankYouPage = lazy(() => import('./pages/RegisterThankYouPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AccountDashboard = lazy(() => import('./pages/AccountDashboard'));
const AccountSettingsPage = lazy(() => import('./pages/AccountSettingsPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const SizeGuidePage = lazy(() => import('./pages/SizeGuidePage'));
const ShippingPage = lazy(() => import('./pages/ShippingPage'));
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const AdminLayout = lazy(() => import('./components/layouts/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));
const AdminRefundsPage = lazy(() => import('./pages/admin/AdminRefundsPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const AdminCustomerDetailPage = lazy(() => import('./pages/admin/AdminCustomerDetailPage'));
const AdminAccountPage = lazy(() => import('./pages/admin/AdminAccountPage'));

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
    name: 'Rapha Lumina Collection',
    path: '/products',
    element: <EnlightenedCollectionPage />,
    public: true,
  },
  {
    name: 'Collection Redirect',
    path: '/teacher',
    element: <Navigate to="/products" replace />,
    public: true,
  },
  {
    name: 'Legacy Collection Redirect',
    path: '/enlightened',
    element: <Navigate to="/products" replace />,
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
