import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface NotificationPanelProps {
  onMarkAllAsRead?: () => void;
}

const NotificationPanel = ({ onMarkAllAsRead }: NotificationPanelProps) => {
  const [page] = useState(1);
  const { data, isLoading, isError } = useNotifications(page, 20);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const formatTimestamp = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return date;
    }
  };

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead.mutateAsync(notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <p className="text-gray-500">Failed to load notifications</p>
      </div>
    );
  }

  const notifications = data?.data || [];

  return (
    <div className="h-full flex flex-col bg-white ">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <SheetClose asChild>
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </SheetClose>
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={markAllAsRead.isPending || notifications.length === 0}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {markAllAsRead.isPending ? 'Marking...' : 'Mark all as read'}
        </Button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="p-4 sm:p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleNotificationClick(notification._id, notification.isRead)}
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
                          {formatTimestamp(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed pr-2">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel; 