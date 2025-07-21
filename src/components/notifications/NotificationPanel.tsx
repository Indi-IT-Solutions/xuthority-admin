import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type: 'review' | 'user' | 'payment' | 'vendor' | 'badge';
}

interface NotificationPanelProps {
  onMarkAllAsRead?: () => void;
}

const NotificationPanel = ({ onMarkAllAsRead }: NotificationPanelProps) => {
  // Mock notifications data matching the image
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'New Review Received',
      description: 'A new user has posted a review. Visit the reviews section to read and moderate it.',
      timestamp: '10 min ago',
      isRead: false,
      type: 'review'
    },
    {
      id: '2',
      title: 'New User Joined',
      description: 'A new user has successfully registered on the platform. View their profile in the user management panel.',
      timestamp: '1 hr ago',
      isRead: false,
      type: 'user'
    },
    {
      id: '3',
      title: 'Payment Received',
      description: 'A new payment has been successfully processed. Check the payments section for full transaction details.',
      timestamp: '2 days ago',
      isRead: false,
      type: 'payment'
    },
    {
      id: '4',
      title: 'New Vendor Application',
      description: 'A new vendor has registered and is awaiting approval. Review their details in the vendor section.',
      timestamp: 'Jul 12, 2025',
      isRead: false,
      type: 'vendor'
    },
    {
      id: '5',
      title: 'New Badge Request',
      description: 'A vendor has requested a new badge. Review the request in the Badges section.',
      timestamp: 'Yesterday',
      isRead: false,
      type: 'badge'
    },
    {
      id: '6',
      title: 'Review Updated by User',
      description: 'A previously submitted review has been edited. Review the changes for accuracy.',
      timestamp: 'Jul 13, 2025',
      isRead: false,
      type: 'review'
    },
    {
      id: '7',
      title: 'Payment Received',
      description: 'A payment of $199.00 was received from Xuthority Inc. for their Premium Subscription.',
      timestamp: 'Jul 11, 2025',
      isRead: false,
      type: 'payment'
    }
  ];

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
          onClick={onMarkAllAsRead}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Mark all as read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 sm:p-5 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
                        {notification.timestamp}
                      </span>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed pr-2">
                    {notification.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel; 