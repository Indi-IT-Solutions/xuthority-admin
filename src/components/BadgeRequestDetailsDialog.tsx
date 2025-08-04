import React from 'react';
import { Calendar, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeRequest } from '@/services/badgeService';

interface BadgeRequestDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  badgeRequest: BadgeRequest | null;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  isApprovePending?: boolean;
  isRejectPending?: boolean;
  isLoading?: boolean;
}

const BadgeRequestDetailsDialog: React.FC<BadgeRequestDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  badgeRequest,
  onApprove,
  onReject,
  isApprovePending = false,
  isRejectPending = false,
  isLoading = false,
}) => {
  // Show loading state
  if (isLoading && !badgeRequest) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading badge request details...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!badgeRequest) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: BadgeRequest['status']) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'approved':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'canceled':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: BadgeRequest['status']) => {
    switch (status) {
      case 'requested':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'canceled':
        return 'Canceled';
      default:
        return 'Unknown';
    }
  };

  const getUserName = (user: BadgeRequest['user']) => {
    if (!user) return 'Unknown User';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.email || 'Unknown User';
  };

  const getUserInitials = (user: BadgeRequest['user']) => {
    if (!user) return '?';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email?.charAt(0).toUpperCase() || '?';
  };

  const canTakeAction = badgeRequest.status === 'requested';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:!min-w-xl p-0 overflow-hidden bg-white ">
        <DialogHeader className="p-6 pb-4 relative">
          <DialogTitle className="text-xl font-semibold text-center">
            Badges Request
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Badge Icon/Avatar */}
          <div className="flex justify-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden p-2"
                style={{ backgroundColor: badgeRequest.badge?.colorCode || '#3B82F6' }}
              >
                {badgeRequest.badge?.icon && badgeRequest.badge?.icon.startsWith('http') ? (
                  <img 
                    src={badgeRequest.badge.icon} 
                    alt={badgeRequest.badge?.title || 'Badge'}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-4xl">{badgeRequest.badge?.icon || '🏆'}</span>
                )}
              </div>
          </div>

          {/* User Details and Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2  ">
            {/* Requested User */}
            <div className="flex sm:items-center space-x-3 sm:col-span-2  w-full border-r border-gray-200">
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage 
                  src={badgeRequest.user?.avatar || ''} 
                  alt={badgeRequest.user?.firstName || 'User'}
                  className="object-cover"
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                  {getUserInitials(badgeRequest.user)} 
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">Requested User</span>
                <span className="text-base font-semibold text-gray-900 line-clamp-2">
                  {getUserName(badgeRequest.user)}
                </span>
              </div>
            </div>

            {/* Requested Date and Status */}
              <div className="flex sm:justify-center sm:items-center space-x-2 w-full sm:col-span-2 border-r border-gray-200  ">
              <div className='w-12 h-12 rounded-full bg-gray-100 flex justify-center items-center'>
              <Calendar className="w-4 h-4 text-gray-500" />
              </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 font-medium">Requested Date</span>
                  <span className="text-base font-semibold text-gray-900">
                    {formatDate(badgeRequest.createdAt)}
                  </span>
                </div>
              </div>
              
          
           <div className='w-full flex sm:justify-center sm:items-center  '>
           <Badge 
                variant="secondary"
                className={`${getStatusColor(badgeRequest.status)} font-medium px-3 py-1 text-sm rounded-full`}
              >
                {getStatusLabel(badgeRequest.status)}
              </Badge>
           </div>
          </div>

          {/* Badge Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Badge Name</label>
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <p className="text-gray-900 font-medium text-base">
                {badgeRequest.badge?.title || 'Unknown Badge'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <div className="p-4 border border-gray-200 rounded-lg bg-white min-h-[120px]">
              <p className="text-gray-600 text-sm leading-relaxed">
                {badgeRequest.badge?.description || 'No description available'}
              </p>
            </div>
          </div>

          {/* Reason (if provided) */}
          {badgeRequest.reason && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Reason</label>
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-700 text-sm break-all">
                  {badgeRequest.reason}
                </p>
              </div>
            </div>
          )}

          {/* Rejection Reason (if rejected) */}
          {badgeRequest.status === 'rejected' && badgeRequest.rejectionReason && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Rejection Reason</label>
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <p className="text-red-700 text-sm">
                  {badgeRequest.rejectionReason}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Only show if status is requested */}
        {canTakeAction && (
          <DialogFooter className="p-6 pt-0 flex gap-4">
            <Button
              variant="destructive"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full py-6 text-base font-medium"
              onClick={() => onReject?.(badgeRequest._id)}
              disabled={isRejectPending || isApprovePending}
            >
              {isRejectPending ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6 text-base font-medium"
              onClick={() => onApprove?.(badgeRequest._id)}
              disabled={isApprovePending || isRejectPending}
            >
              {isApprovePending ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BadgeRequestDetailsDialog; 