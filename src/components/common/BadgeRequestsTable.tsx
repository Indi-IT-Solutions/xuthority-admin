import React, { useState } from 'react';
import { MoreHorizontal, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BadgeRequest } from '@/services/badgeService';

interface BadgeRequestsTableProps {
  badgeRequests: BadgeRequest[];
  onViewDetails?: (requestId: string) => void;
  onApproveRequest?: (requestId: string) => void;
  onRejectRequest?: (requestId: string) => void;
}

interface ActionMenuProps {
  request: BadgeRequest;
  onViewDetails?: (requestId: string) => void;
  onApproveRequest?: (requestId: string) => void;
  onRejectRequest?: (requestId: string) => void;
}

const ActionMenu = ({ 
  request, 
  onViewDetails, 
  onApproveRequest,
  onRejectRequest,
}: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      color: 'text-blue-600',
      onClick: () => onViewDetails?.(request._id),
      show: true
    },
    {
      label: 'Approve Request',
      icon: CheckCircle,
      color: 'text-green-600',
      onClick: () => onApproveRequest?.(request._id),
      show: request.status === 'requested'
    },
    {
      label: 'Reject Request',
      icon: XCircle,
      color: 'text-red-600',
      onClick: () => onRejectRequest?.(request._id),
      show: request.status === 'requested'
    }
  ].filter(action => action.show);

  const handleButtonClick = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // w-48 = 12rem = 192px
      const dropdownHeight = 150; // Approximate height for badge actions
      
      let top = rect.bottom + window.scrollY + 4; // 4px margin
      let left = rect.right + window.scrollX - dropdownWidth; // Align right edge
      
      // Adjust if dropdown would go off-screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Adjust horizontal position if off-screen
      if (left < 10) {
        left = rect.left + window.scrollX; // Align to left edge of button
      }
      if (left + dropdownWidth > viewportWidth - 10) {
        left = viewportWidth - dropdownWidth - 10;
      }
      
      // Adjust vertical position if off-screen
      if (top + dropdownHeight > viewportHeight + window.scrollY - 10) {
        top = rect.top + window.scrollY - dropdownHeight - 4; // Show above button
      }
      
      setDropdownPosition({ top, left });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="p-1 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="fixed w-40 md:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`w-full px-3 md:px-4 py-2 text-left text-xs md:text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2 ${action.color}`}
              >
                <action.icon className="w-3 h-3 md:w-4 md:h-4" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: BadgeRequest['status'] }) => {
  const statusConfig = {
    requested: {
      variant: 'secondary' as const,
      icon: Clock,
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    approved: {
      variant: 'secondary' as const,
      icon: CheckCircle,
      label: 'Approved',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    rejected: {
      variant: 'secondary' as const,
      icon: XCircle,
      label: 'Rejected',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    canceled: {
      variant: 'secondary' as const,
      icon: XCircle,
      label: 'Canceled',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1 text-xs ${config.className}`}
    >
      <IconComponent className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

const BadgeRequestsTable = ({ 
  badgeRequests, 
  onViewDetails, 
  onApproveRequest,
  onRejectRequest
}: BadgeRequestsTableProps) => {
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) {
      return 'No date available';
    }

    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Use the badge requests as-is since sorting is handled by the database
  const sortedBadgeRequests = badgeRequests;

  const getUserName = (user: BadgeRequest['user']) => {
    if (!user) return 'Unknown User';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.email || 'Unknown User';
  };

  const getBadgeTitle = (badge: BadgeRequest['badge']) => {
    return badge?.title || 'Unknown Badge';
  };

  const getBadgeDescription = (badge: BadgeRequest['badge']) => {
    return badge?.description || 'No description available';
  };

  const getBadgeColor = (badge: BadgeRequest['badge']) => {
    return badge?.colorCode || '#3B82F6';
  };

  const getBadgeIcon = (badge: BadgeRequest['badge']) => {
    return badge?.icon || '🏆';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto relative">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 font-medium text-gray-900 text-sm">
                  Badge
                </th>
                <th className="text-left px-6 py-4 font-medium text-gray-900 text-sm">
                  Requested By
                </th>
                <th className="text-left px-6 py-4 font-medium text-gray-900 text-sm">
                  Status
                </th>
                <th className="text-left px-6 py-4 font-medium text-gray-900 text-sm">
                  Requested Date
                </th>
                <th className="text-left px-6 py-4 font-medium text-gray-900 text-sm">
                  Reason
                </th>
                <th className="text-center px-6 py-4 font-medium text-gray-900 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedBadgeRequests.map((request) => (
                <tr key={request._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: getBadgeColor(request.badge) }}
                      >
                        {getBadgeIcon(request.badge)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {getBadgeTitle(request.badge)}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {getBadgeDescription(request.badge)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {getUserName(request.user)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {request.user?.email || 'No email'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(request.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-[200px] truncate">
                      {request.reason || 'No reason provided'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <ActionMenu
                      request={request}
                      onViewDetails={onViewDetails}
                      onApproveRequest={onApproveRequest}
                      onRejectRequest={onRejectRequest}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        <div className="divide-y divide-gray-100">
          {sortedBadgeRequests.map((request) => (
            <div key={request._id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: getBadgeColor(request.badge) }}
                  >
                    {getBadgeIcon(request.badge)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">
                      {getBadgeTitle(request.badge)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {getBadgeDescription(request.badge)}
                    </div>
                  </div>
                </div>
                <ActionMenu
                  request={request}
                  onViewDetails={onViewDetails}
                  onApproveRequest={onApproveRequest}
                  onRejectRequest={onRejectRequest}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Requested by:</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {getUserName(request.user)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {request.user?.email || 'No email'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status:</span>
                  <StatusBadge status={request.status} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Date:</span>
                  <span className="text-xs text-gray-900">
                    {formatDate(request.createdAt)}
                  </span>
                </div>

                {request.reason && (
                  <div className="flex items-start justify-between">
                    <span className="text-xs text-gray-500">Reason:</span>
                    <span className="text-xs text-gray-900 text-right max-w-[200px]">
                      {request.reason}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {sortedBadgeRequests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No badge requests found</div>
        </div>
      )}
    </div>
  );
};

export default BadgeRequestsTable; 