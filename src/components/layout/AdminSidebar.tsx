import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  Users,
  Package,
  Star,
  Settings,
  LogOut,
  CreditCard,
  Award,
  FileText,
  BookOpen,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAdminStore from '@/store/useAdminStore';
import { useEffect } from 'react';

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    label: 'Vendors',
    href: '/vendors',
    icon: Package,
  },
  {
    label: 'Users Management',
    href: '/users',
    icon: Users,
  },
  {
    label: 'Reviews',
    href: '/reviews',
    icon: Star,
  },
  {
    label: 'Subscription Plans',
    href: '/subscription-plans',
    icon: CreditCard,
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: CreditCard,
  },
  {
    label: 'Badges',
    href: '/badges',
    icon: Award,
  },
  {
    label: 'Pages',
    href: '/pages',
    icon: FileText,
  },
  {
    label: 'Resource Center',
    href: '/resource-center',
    icon: BookOpen,
  },
  {
    label: 'Profile Settings',
    href: '/profile-settings',
    icon: Settings,
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { mobileSidebarOpen, setMobileSidebarOpen, logoutWithAPI } = useAdminStore();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, setMobileSidebarOpen]);

  // Close sidebar when clicking outside on mobile
  const handleBackdropClick = () => {
    setMobileSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logoutWithAPI();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={handleBackdropClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out flex flex-col",
          // Desktop: always visible
          "md:translate-x-0",
          // Mobile: slide in/out based on state
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 md:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="sm:py-6 py-4 pl-4 flex justify-left items-start ">
          <div className="flex items-center">
            <img src="/xuthority_logo.svg" alt="Xuthority" className="w-full sm:h-12 h-10 object-contain" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto overscroll-contain">
          <div className="space-y-2 h-full">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors',
                    isActive && 'bg-blue-600 text-white hover:bg-blue-500'
                  )}
                > 
                  <div className='flex items-center gap-2 bg-gray-100 rounded-lg p-2'>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-gray-700' : 'text-gray-700'}`} />
                  </div>
                  <span className="text-sm ml-3 font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="flex items-center p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors w-full mt-4"
            >
              <div className='flex items-center gap-2 bg-gray-100 rounded-lg p-2'>
                <LogOut className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-sm ml-3 font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar; 