import React, { useState } from 'react';
import { MoreHorizontal, Eye, Trash2, Edit, Copy } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { TransformedBadge } from '@/services/badgeService';

interface BadgesTableProps {
  badges: TransformedBadge[];
  onViewDetails?: (badgeId: string) => void;
  onEditBadge?: (badgeId: string) => void;
  onDeleteBadge?: (badgeId: string) => void;
  onToggleStatus?: (badgeId: string, status: 'active' | 'inactive') => void;
  onSelectedBadgesChange?: (selectedIds: string[]) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
}

interface ActionMenuProps {
  badge: TransformedBadge;
  onViewDetails?: (badgeId: string) => void;
  onEditBadge?: (badgeId: string) => void;
  onDeleteBadge?: (badgeId: string) => void;
}

const ActionMenu = ({ 
  badge, 
  onViewDetails, 
  onEditBadge,
  onDeleteBadge,
}: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const actions = [
    {
      label: 'Edit Badge',
      icon: Edit,
      color: 'text-green-600',
      onClick: () => onEditBadge?.(badge._id)
    },
    {
      label: 'Delete Badge',
      icon: Trash2,
      color: 'text-red-600',
      onClick: () => onDeleteBadge?.(badge._id)
    }
  ];

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // w-48 = 12rem = 192px
      const dropdownHeight = 120; // Approximate height for badge actions
      
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
        className="p-1 md:p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
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
                className={`w-full px-3 md:px-4 py-2 text-left text-xs md:text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2 ${action.color} cursor-pointer`}
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

const BadgesTable = ({ 
  badges, 
  onViewDetails, 
  onEditBadge,
  onDeleteBadge,
  onToggleStatus,
  onSelectedBadgesChange,
  onBulkDelete 
}: BadgesTableProps) => {
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  // Check if all badges are selected
  const isAllSelected = badges.length > 0 && selectedBadges.length === badges.length;
  
  // Check if some badges are selected (for indeterminate state)
  const isIndeterminate = selectedBadges.length > 0 && selectedBadges.length < badges.length;

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      setSelectedBadges([]);
      onSelectedBadgesChange?.([]);
    } else {
      // Select all
      const allIds = badges.map(badge => badge._id);
      setSelectedBadges(allIds);
      onSelectedBadgesChange?.(allIds);
    }
  };

  // Handle individual checkbox
  const handleSelectBadge = (badgeId: string) => {
    const newSelection = selectedBadges.includes(badgeId)
      ? selectedBadges.filter(id => id !== badgeId)
      : [...selectedBadges, badgeId];
    
    setSelectedBadges(newSelection);
    onSelectedBadgesChange?.(newSelection);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedBadges.length > 0 && onBulkDelete) {
      onBulkDelete(selectedBadges);
      setSelectedBadges([]);
      onSelectedBadgesChange?.([]);
    }
  };

  // Handle status toggle
  const handleStatusToggle = (badge: TransformedBadge) => {
    const newStatus = badge.status === 'active' ? 'inactive' : 'active';
    onToggleStatus?.(badge._id, newStatus);
  };

  return (
    <div>
      {/* Bulk Delete Button */}
 

{selectedBadges.length > 0 && (
        <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
          <span className="text-xs md:text-sm font-medium text-blue-800">
            {selectedBadges.length} badge{selectedBadges.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1 md:px-4 md:py-2 bg-red-600 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 md:space-x-2"
          >
            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
            <span>Delete Selected</span>
          </button>
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
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Badge Icon</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Badge Name</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Earned by</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Description</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {badges.map((badge, index) => (
              <tr key={badge._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* S. No. with checkbox */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <input 
                      type="checkbox" 
                      checked={selectedBadges.includes(badge._id)}
                      onChange={() => handleSelectBadge(badge._id)}
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs md:text-sm font-medium text-gray-900">
                      #{index + 1}
                    </span>
                  </div>
                </td>

                {/* Badge Icon */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg md:text-xl">{badge.icon}</span>
                  </div>
                </td>

                {/* Badge Name */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="text-xs md:text-sm font-medium text-gray-900 truncate">
                    {badge.title}
                  </div>
                </td>

                {/* Earned by */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-900">{badge.earnedBy} Vendors</span>
                </td>

                {/* Description */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="text-xs md:text-sm text-gray-600 max-w-xs truncate">
                    {badge.description}
                  </div>
                </td>

                {/* Status Toggle */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <Switch
                    checked={badge.status === 'active'}
                    onCheckedChange={() => handleStatusToggle(badge)}
                    className="scale-90 md:scale-100"
                  />
                </td>

                {/* Actions */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <ActionMenu 
                    badge={badge}
                    onEditBadge={onEditBadge}
                    onDeleteBadge={onDeleteBadge}
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

export default BadgesTable; 