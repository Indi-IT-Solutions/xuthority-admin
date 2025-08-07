import { ArrowLeft, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { useNotificationNavigation } from '@/utils/notificationNavigation';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton loading components for notifications
const NotificationSkeleton = () => (
  <div className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
    <div className="flex items-start justify-between gap-3 sm:gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="w-2 h-2 rounded-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  </div>
);

const NotificationsListSkeleton = () => (
  <div className="divide-y divide-gray-100">
    {Array.from({ length: 8 }).map((_, index) => (
      <NotificationSkeleton key={index} />
    ))}
  </div>
);

const HeaderSkeleton = () => (
  <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
    <div className="flex items-center gap-3">
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="h-6 w-32" />
    </div>
    <Skeleton className="h-8 w-28" />
  </div>
);

interface NotificationPanelProps {
  onMarkAllAsRead?: () => void;
  onClose?: () => void;
}

const NotificationPanel = ({ onMarkAllAsRead, onClose }: NotificationPanelProps) => {
  const [page, setPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const { data, isLoading, isError, isFetching } = useNotifications(page, 10);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const { handleNotificationClick } = useNotificationNavigation();
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllNotifications(data.data);
      } else {
        setAllNotifications(prev => [...prev, ...data.data]);
      }
      
      // Check if there are more notifications to load
      const totalPages = Math.ceil((data.meta?.total || 0) / 10);
      setHasMore(page < totalPages);
    }
  }, [data, page]);

  const formatTimestamp = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return date;
    }
  };

  const handleNotificationItemClick = async (notification: any) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead.mutateAsync(notification._id);
    }
    
    // Navigate to the appropriate page and close sidebar
    handleNotificationClick(notification, onClose);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="h-full flex flex-col bg-white">
        <HeaderSkeleton />
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <NotificationsListSkeleton />
        </div>
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

  const allRead = allNotifications.length > 0 && allNotifications.every(n => n.isRead);

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
          disabled={markAllAsRead.isPending || allNotifications.length === 0 || allRead}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {markAllAsRead.isPending ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Marking...</span>
            </div>
          ) : (
            'Mark all as read'
          )}
        </Button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {allNotifications.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
              <p>No notifications yet</p>
              <p className="text-sm text-gray-400">You'll see notifications here when they arrive</p>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {allNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 sm:p-5 hover:bg-gray-50 transition-colors cursor-pointer ${
                  markAsRead.isPending && markAsRead.variables === notification._id ? 'opacity-50' : ''
                }`}
                onClick={() => handleNotificationItemClick(notification)}
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
                        {markAsRead.isPending && markAsRead.variables === notification._id && (
                          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
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
            {hasMore && (
              <div className="p-4 flex justify-center border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="flex items-center gap-2"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Load More
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel; 