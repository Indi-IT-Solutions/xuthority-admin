import React, { useState } from 'react';
import { MoreHorizontal, Eye, Trash2, Ban, Check, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/utils/getInitials';

interface User {
  id: number;
  _id: string; // MongoDB ID for API calls
  userDetails: {
    name: string;
    email: string;
    avatar: string;
  };
  reviewPosted: number;
  approved: number;
  pending: number;
  disputed: number;
  loginType: 'Normal' | 'Google' | 'LinkedIn';
  joinedOn: string;
  status: 'Active' | 'Blocked';
  lastActivity: string;
}

interface UsersTableProps {
  users: User[];
  onViewDetails?: (userId: string) => void;
  onBlockUser?: (userId: string) => void;
  onUnblockUser?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onVerifyUser?: (userId: string) => void;
  onSelectedUsersChange?: (selectedIds: string[]) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
}

interface ActionMenuProps {
  user: User;
  onViewDetails?: (userId: string) => void;
  onBlockUser?: (userId: string) => void;
  onUnblockUser?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onVerifyUser?: (userId: string) => void;
}

const ActionMenu = ({ 
  user, 
  onViewDetails, 
  onBlockUser, 
  onUnblockUser,
  onDeleteUser,
  onVerifyUser
}: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const getActions = () => {
    switch (user.status) {
      case 'Active':
        return [
          {
            label: 'View Details',
            icon: Eye,
            color: 'text-blue-600',
            onClick: () => onViewDetails?.(user._id)
          },
          {
            label: 'Verify User',
            icon: Check,
            color: 'text-green-600',
            onClick: () => onVerifyUser?.(user._id)
          },
          {
            label: 'Block User',
            icon: Ban,
            color: 'text-red-600',
            onClick: () => onBlockUser?.(user._id)
          },
          {
            label: 'Delete User',
            icon: Trash2,
            color: 'text-red-600',
            onClick: () => onDeleteUser?.(user._id)
          }
        ];
      case 'Blocked':
        return [
          {
            label: 'View Details',
            icon: Eye,
            color: 'text-blue-600',
            onClick: () => onViewDetails?.(user._id)
          },
          {
            label: 'Unblock User',
            icon: Check,
            color: 'text-green-600',
            onClick: () => onUnblockUser?.(user._id)
          },
          {
            label: 'Delete User',
            icon: Trash2,
            color: 'text-red-600',
            onClick: () => onDeleteUser?.(user._id)
          }
        ];
      default:
        return [];
    }
  };

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // w-48 = 12rem = 192px
      const dropdownHeight = 200; // Approximate height
      
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

  const actions = getActions();

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="p-1 md:p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 cursor-pointer" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu with fixed positioning */}
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
                className={`w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm ${action.color} hover:bg-gray-50 flex items-center space-x-2 transition-colors cursor-pointer`}
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

const UsersTable = ({ 
  users, 
  onViewDetails, 
  onBlockUser,
  onUnblockUser,
  onDeleteUser,
  onVerifyUser,
  onSelectedUsersChange,
  onBulkDelete 
}: UsersTableProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium";
    
    switch (status) {
      case 'Active':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'Blocked':
        return `${baseClasses} bg-red-100 text-red-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  const getLoginTypeBadge = (loginType: string) => {
    const baseClasses = "px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium";
    
    switch (loginType) {
      case 'Normal':
        return `${baseClasses} bg-blue-100 text-blue-700`;
      case 'Google':
        return `${baseClasses} bg-red-100 text-red-700`;
      case 'LinkedIn':
        return `${baseClasses} bg-blue-100 text-blue-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  // Check if all users are selected
  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  
  // Check if some users are selected (for indeterminate state)
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < users.length;

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      setSelectedUsers([]);
      onSelectedUsersChange?.([]);
    } else {
      // Select all
      const allIds = users.map(user => user._id);
      setSelectedUsers(allIds);
      onSelectedUsersChange?.(allIds);
    }
  };

  // Handle individual checkbox
  const handleSelectUser = (userId: string) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    
    setSelectedUsers(newSelection);
    onSelectedUsersChange?.(newSelection);
  };

  // Handle bulk actions
  const handleBulkActions = () => {
    if (selectedUsers.length === 0) return;

    const userCount = selectedUsers.length;
    const confirmed = window.confirm(
      `Are you sure you want to delete ${userCount} selected user${
        userCount > 1 ? "s" : ""
      }?`
    );

    if (confirmed) {
      onBulkDelete?.(selectedUsers);
      setSelectedUsers([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-xs md:text-sm font-medium text-blue-800">
            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
          </span>
          {/* <button
            onClick={handleBulkActions}
            className="px-3 py-1 md:px-4 md:py-2 bg-red-600 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 md:space-x-2"
          >
            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
            <span>Delete Selected</span>
          </button> */}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-gray-100 min-h-[65vh] relative">
        <table className="w-full min-w-[1200px]">
          {/* Table Header */}
          <thead className="bg-gray-100 rounded-b-2xl">
            <tr>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600 min-w-[120px]">
                <div className="flex items-center space-x-2 md:space-x-3">
                  {/* <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  /> */}
                  <span>S. No.</span>
                </div>
              </th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">User Details</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Review Posted</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Approved</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Pending</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Disputed</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Login type</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Joined On</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Last Activity</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* S. No. with checkbox */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    {/* <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    /> */}
                    <span className="text-xs md:text-sm font-medium text-gray-900">
                      #{index + 1}
                    </span>
                  </div>
                </td>

                {/* User Details */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                      <AvatarImage 
                        src={user.userDetails.avatar} 
                        alt={user.userDetails.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs md:text-sm font-semibold">
                        {getInitials(user.userDetails.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-xs md:text-sm font-medium text-gray-900 truncate">
                        {user.userDetails.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user.userDetails.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Review Posted */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-900">{user.reviewPosted}</span>
                </td>

                {/* Approved */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-green-600 font-medium">{user.approved}</span>
                </td>

                {/* Pending */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-yellow-600 font-medium">{user.pending}</span>
                </td>

                {/* Disputed */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-red-600 font-medium">{user.disputed}</span>
                </td>

                {/* Login Type */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className={getLoginTypeBadge(user.loginType)}>
                    {user.loginType}
                  </span>
                </td>

                {/* Joined On */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">{user.joinedOn}</span>
                </td>

                {/* Status */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className={getStatusBadge(user.status)}>
                    {user.status}
                  </span>
                </td>

                {/* Last Activity */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">{user.lastActivity}</span>
                </td>

                {/* Actions */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <ActionMenu 
                    user={user}
                    onViewDetails={onViewDetails}
                    onBlockUser={onBlockUser}
                    onUnblockUser={onUnblockUser}
                    onDeleteUser={onDeleteUser}
                    onVerifyUser={onVerifyUser}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable; 