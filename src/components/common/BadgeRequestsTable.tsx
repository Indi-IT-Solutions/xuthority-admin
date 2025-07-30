import React, { useState } from 'react';
import { MoreHorizontal, Eye, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BadgeRequest } from '@/services/badgeService';

interface BadgeRequestsTableProps {
  badgeRequests: BadgeRequest[];
  onViewDetails?: (requestId: string) => void;
  onApproveRequest?: (requestId: string) => void;
  onRejectRequest?: (requestId: string) => void;
  onSelectedRequestsChange?: (selectedIds: string[]) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
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

  const getActions = () => {
    switch (request.status) {
      case 'requested':
        return [
          {
            label: 'View Details',
            icon: Eye,
            color: 'text-blue-600',
            onClick: () => onViewDetails?.(request._id)
          },
          {
            label: 'Approve',
            icon: CheckCircle,
            color: 'text-green-600',
            onClick: () => onApproveRequest?.(request._id)
          },
          {
            label: 'Reject',
            icon: XCircle,
            color: 'text-red-600',
            onClick: () => onRejectRequest?.(request._id)
          }
        ];
      default:
        return [
          {
            label: 'View Details',
            icon: Eye,
            color: 'text-blue-600',
            onClick: () => onViewDetails?.(request._id)
          }
        ];
    }
  };

  const actions = getActions();

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 176; // w-44 = 11rem = 176px
      const dropdownHeight = 200; // Approximate height for request actions
      
      let top = rect.bottom + 4; // 4px margin, using viewport coordinates
      let left = rect.right - dropdownWidth; // Align right edge
      
      // Adjust if dropdown would go off-screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Adjust horizontal position if off-screen
      if (left < 10) {
        left = rect.left; // Align to left edge of button
      }
      if (left + dropdownWidth > viewportWidth - 10) {
        left = viewportWidth - dropdownWidth - 10;
      }
      
      // Adjust vertical position if off-screen
      if (top + dropdownHeight > viewportHeight - 10) {
        top = rect.top - dropdownHeight - 4; // Show above button
      }
      
      setDropdownPosition({ top, left });
    }
  };

  const handleButtonClick = () => {
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown on scroll
  React.useEffect(() => {
    if (isOpen) {
      const handleScroll = () => {
        setIsOpen(false);
      };

      const handleResize = () => {
        if (isOpen) {
          updateDropdownPosition();
        }
      };

      // Add scroll listeners to both window and potential scroll containers
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        onClick={handleButtonClick}
        className="p-1 md:p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div 
            className="fixed w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Icon className={`w-4 h-4 mr-3 ${action.color}`} />
                  <span className="text-gray-700">{action.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: BadgeRequest['status'] }) => {
  const statusConfig = {
    requested: {
      icon: Clock,
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800'
    },
    approved: {
      icon: CheckCircle,
      label: 'Approved',
      className: 'bg-green-100 text-green-800'
    },
    rejected: {
      icon: XCircle,
      label: 'Rejected',
      className: 'bg-red-100 text-red-800'
    },
    canceled: {
      icon: XCircle,
      label: 'Canceled',
      className: 'bg-gray-100 text-gray-800'
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium flex items-center gap-1 w-fit ${config.className}`}>
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const BadgeRequestsTable = ({ 
  badgeRequests, 
  onViewDetails, 
  onApproveRequest,
  onRejectRequest,
  onSelectedRequestsChange,
  onBulkDelete 
}: BadgeRequestsTableProps) => {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

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

  // Check if all requests are selected
  const isAllSelected = badgeRequests.length > 0 && selectedRequests.length === badgeRequests.length;
  
  // Check if some requests are selected (for indeterminate state)
  const isIndeterminate = selectedRequests.length > 0 && selectedRequests.length < badgeRequests.length;

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      setSelectedRequests([]);
      onSelectedRequestsChange?.([]);
    } else {
      // Select all
      const allIds = badgeRequests.map(request => request._id);
      setSelectedRequests(allIds);
      onSelectedRequestsChange?.(allIds);
    }
  };

  // Handle individual checkbox
  const handleSelectRequest = (requestId: string) => {
    const newSelection = selectedRequests.includes(requestId)
      ? selectedRequests.filter(id => id !== requestId)
      : [...selectedRequests, requestId];
    
    setSelectedRequests(newSelection);
    onSelectedRequestsChange?.(newSelection);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedRequests.length > 0 && onBulkDelete) {
      onBulkDelete(selectedRequests);
      setSelectedRequests([]);
      onSelectedRequestsChange?.([]);
    }
  };

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
    <div>
      {/* Bulk Delete Button */}


{selectedRequests.length > 0 && (
        <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
          <span className="text-xs md:text-sm font-medium text-blue-800">
            {selectedRequests.length} badge request{selectedRequests.length > 1 ? 's' : ''} selected
          </span>
          {/* <button
            onClick={handleBulkDelete}
            className="px-3 py-1 md:px-4 md:py-2 bg-red-600 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 md:space-x-2"
          >
            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
            <span>Delete Selected</span>
          </button> */}
        </div>
      )}


      {/* Table */}
      <div className="overflow-auto gap-3 rounded-2xl bg-white shadow-sm border border-gray-100 min-h-[65vh]">
        <table className="w-full min-w-[1000px]">
          {/* Table Header */}
          <thead className="bg-gray-100 rounded-b-2xl">
            <tr>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600 min-w-[120px]">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span>S. No.</span>
                </div>
              </th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Badge Details</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Requested By</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Request Date</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Reason</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {badgeRequests.map((request, index) => (
              <tr key={request._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* S. No. with checkbox */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <input 
                      type="checkbox" 
                      checked={selectedRequests.includes(request._id)}
                      onChange={() => handleSelectRequest(request._id)}
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs md:text-sm font-medium text-gray-900">
                      #{index + 1}
                    </span>
                  </div>
                </td>

                {/* Badge Details */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div 
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-sm md:text-base font-medium flex-shrink-0"
                      style={{ backgroundColor: getBadgeColor(request.badge) }}
                    >
                      {getBadgeIcon(request.badge)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs md:text-sm font-medium text-gray-900 truncate">
                        {getBadgeTitle(request.badge)}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {getBadgeDescription(request.badge)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Requested By */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="min-w-0">
                    <div className="text-xs md:text-sm font-medium text-gray-900 truncate">
                      {getUserName(request.user)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {request.user?.email || 'No email'}
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <StatusBadge status={request.status} />
                </td>

                {/* Request Date */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(request.createdAt)}
                  </span>
                </td>

                {/* Reason */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="text-xs md:text-sm text-gray-900 max-w-[200px] truncate">
                    {request.reason || 'No reason provided'}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3 px-3 md:py-4 md:px-6">
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

        {/* Empty State */}
        {badgeRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No badge requests found</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeRequestsTable; 