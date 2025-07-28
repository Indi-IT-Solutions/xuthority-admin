import React, { useState } from 'react';
import { MoreHorizontal, Eye, Edit2, Trash2 } from 'lucide-react';
import { CollectionItem, CollectionConfig } from '@/services/collectionService';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface ActionMenuProps {
  item: CollectionItem;
  onViewDetails?: (itemId: string) => void;
  onEditItem?: (item: CollectionItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onDeleteClick?: (itemId: string, itemName: string) => void;
}

interface CollectionTableProps {
  items: CollectionItem[];
  config: CollectionConfig;
  onViewDetails?: (itemId: string) => void;
  onEditItem?: (item: CollectionItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onSelectedItemsChange?: (selectedIds: string[]) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
}

const ActionMenu = ({ 
  item, 
  onViewDetails, 
  onEditItem,
  onDeleteItem,
  onDeleteClick
}: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const actions = [
   
    {
      label: 'Edit',
      icon: Edit2,
      color: 'text-green-600',
      onClick: () => onEditItem?.(item)
    },
    {
      label: 'Delete',
      icon: Trash2,
      color: 'text-red-600',
      onClick: () => {
        const itemName = item.name || item.title || 'this item';
        onDeleteClick?.(item._id, itemName);
      }
    }
  ];

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 176; // w-44 = 11rem = 176px
      const dropdownHeight = actions.length * 40 + 16; // Approximate height
      
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
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer"
        aria-label="More actions"
      >
        <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
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

const CollectionTable = ({ 
  items, 
  config,
  onViewDetails, 
  onEditItem,
  onDeleteItem,
  onSelectedItemsChange,
  onBulkDelete 
}: CollectionTableProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [isDeleting, setIsDeleting] = useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format field value based on type
  const formatFieldValue = (value: any, type: string) => {
    switch (type) {
      case 'date':
        return formatDate(value);
      case 'status':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {value}
          </span>
        );
      default:
        return value || '-';
    }
  };

  // Check if all items are selected
  const isAllSelected = items.length > 0 && selectedItems.length === items.length;
  
  // Check if some items are selected (for indeterminate state)
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < items.length;

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
      onSelectedItemsChange?.([]);
    } else {
      const allIds = items.map(item => item._id);
      setSelectedItems(allIds);
      onSelectedItemsChange?.(allIds);
    }
  };

  // Handle individual checkbox
  const handleSelectItem = (itemId: string) => {
    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];
    
    setSelectedItems(newSelection);
    onSelectedItemsChange?.(newSelection);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedItems.length > 0 && onBulkDelete) {
      onBulkDelete(selectedItems);
      setSelectedItems([]);
      onSelectedItemsChange?.([]);
    }
  };



  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-xs md:text-sm font-medium text-blue-800">
            {selectedItems.length} {config.name.toLowerCase()}{selectedItems.length > 1 ? 's' : ''} selected
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

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-gray-100 min-h-[65vh] relative">
        <table className="w-full min-w-[800px]">
          {/* Table Header */}
          <thead className="bg-gray-100 rounded-b-2xl">
            <tr>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600 min-w-[120px]">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span>S. No.</span>
                </div>
              </th>
              {config.fields.map((field) => (
                <th key={field.key} className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">
                  {field.label}
                </th>
              ))}
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {items.map((item, index) => (
              <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* S. No. with checkbox */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(item._id)}
                      onChange={() => handleSelectItem(item._id)}
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs md:text-sm font-medium text-gray-900">
                      #{index + 1}
                    </span>
                  </div>
                </td>

                {/* Dynamic Fields */}
                {config.fields.map((field) => (
                  <td key={field.key} className="py-3 px-3 md:py-4 md:px-6">
                    <div className="flex items-center">
                      {formatFieldValue(item[field.key], field.type)}
                    </div>
                  </td>
                ))}

                {/* Actions */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <ActionMenu
                    item={item}
                    onViewDetails={onViewDetails}
                    onEditItem={onEditItem}
                    onDeleteItem={onDeleteItem}
                    onDeleteClick={onDeleteItem}
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

export default CollectionTable; 