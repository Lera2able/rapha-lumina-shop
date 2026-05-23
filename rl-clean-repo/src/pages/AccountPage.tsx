import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, ShoppingBag, Heart, Settings } from 'lucide-react';

export default function AccountPage() {
  const location = useLocation();

  const navItems = [
    { to: '/account', label: 'Dashboard', icon: User },
    { to: '/account/orders', label: 'Order History', icon: ShoppingBag },
    { to: '/account/favorites', label: 'Favorites', icon: Heart },
    { to: '/account/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </aside>

          <div className="md:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
