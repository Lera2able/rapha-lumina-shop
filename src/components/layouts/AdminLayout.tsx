import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import PageMeta from '@/components/common/PageMeta';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  RefreshCw,
  Users,
  MailPlus,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminLayout() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || profile?.role !== 'admin') {
      navigate('/');
    }
  }, [user, profile, navigate]);

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/subscribers', label: 'Subscribers', icon: MailPlus },
    { path: '/admin/campaigns', label: 'Campaign Hub', icon: Megaphone },
    { path: '/admin/refunds', label: 'Refunds', icon: RefreshCw },
    { path: '/admin/account', label: 'Account', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <PageMeta
        title="Admin | Rapha Lumina"
        description="Administrative area for Rapha Lumina."
        canonicalPath={location.pathname}
        robots="noindex,nofollow"
      />
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background border rounded-md shadow-lg"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-background border-r
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/rapha-lumina-logo.png"
                alt="Rapha Lumina"
                className="h-10 w-10 object-contain"
                loading="eager"
                decoding="async"
              />
              <div>
                <span className="text-lg font-bold text-primary block">Rapha Lumina</span>
                <span className="text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted text-foreground'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Sign Out */}
          <div className="p-4 border-t space-y-2">
            <div className="px-4 py-2">
              <p className="text-sm font-medium">{profile?.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="container py-8 px-4 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
