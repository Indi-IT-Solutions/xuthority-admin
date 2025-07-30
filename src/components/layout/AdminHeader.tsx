import { Bell, Menu } from 'lucide-react';
import useAdminStore from '@/store/useAdminStore';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/utils/getInitials';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { useUnreadCount } from '@/hooks/useNotifications';

const AdminHeader = () => {
  const { user, toggleMobileSidebar } = useAdminStore();
  const navigate = useNavigate();
  const { data: unreadData } = useUnreadCount();

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-7 py-4 md:py-5 flex items-center justify-between md:justify-end">
      {/* Mobile hamburger menu */}
      <button 
        onClick={toggleMobileSidebar}
        className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Notifications */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="relative p-2 md:p-3 text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 rounded-full cursor-pointer">
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
              {unreadData?.data?.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center font-medium">
                  {unreadData.data.count > 99 ? '99+' : unreadData.data.count}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 bg-white sm:min-w-md">
            <NotificationPanel />
          </SheetContent>
        </Sheet>

        {/* User Profile */}
        <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer" onClick={() => navigate('/profile-settings')}>
          <Avatar className="w-8 h-8 md:w-12 md:h-12">
            <AvatarImage 
              src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"} 
              alt={user?.displayName || 'Admin User'}
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs md:text-base font-semibold">
              {getInitials(user?.displayName || 'Admin User')}
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden sm:flex justify-center items-left flex-col">
            <div className="text-sm md:text-lg font-semibold text-gray-900">
              {user?.displayName || 'Admin User'}
            </div>
            <div className="text-blue-600 hover:text-blue-500 text-xs md:text-sm font-medium cursor-pointer">
              View Profile
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 