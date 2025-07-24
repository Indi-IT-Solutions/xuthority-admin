import React from 'react';
import { Calendar } from 'lucide-react';
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'canceled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-center">
            Badges Request
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Badge Icon/Avatar */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: badgeRequest.badge?.colorCode || '#3B82F6' }}
              >
                {badgeRequest.badge?.icon || '🏆'}
              </div>
            </div>
          </div>

          {/* User Details and Status Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Requested User */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500 font-medium">Requested User</p>
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={badgeRequest.user?.avatar} />
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                    {getUserInitials(badgeRequest.user)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">
                    {getUserName(badgeRequest.user)}
                  </p>
                </div>
              </div>
            </div>

            {/* Requested Date and Status */}
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500 font-medium">Requested Date</p>
                <div className="flex items-center space-x-2 text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {formatDate(badgeRequest.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Badge 
                  variant="secondary"
                  className={`${getStatusColor(badgeRequest.status)} font-medium`}
                >
                  {getStatusLabel(badgeRequest.status)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Badge Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Badge Name</label>
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-gray-900 font-medium">
                {badgeRequest.badge?.title || 'Unknown Badge'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Description</label>
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 min-h-[100px]">
              <p className="text-gray-700 text-sm leading-relaxed">
                {badgeRequest.badge?.description || 'No description available'}
              </p>
            </div>
          </div>

          {/* Reason (if provided) */}
          {badgeRequest.reason && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Reason</label>
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-700 text-sm  break-all">
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
          <DialogFooter className="p-6 pt-0 flex-row gap-3">
            <Button
              variant="destructive"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full py-3"
              onClick={() => onReject?.(badgeRequest._id)}
              disabled={isRejectPending || isApprovePending}
            >
              {isRejectPending ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full py-3"
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