import React, { useState } from 'react';
import { Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetaTag {
  _id: string;
  pageName: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdatedDate: string;
  status?: 'active' | 'inactive';
}

interface ActionMenuProps {
  metaTag: MetaTag;
  onViewDetails?: (metaTag: MetaTag | string) => void;
}

interface MetaTagsTableProps {
  metaTags: MetaTag[];
  onViewDetails?: (metaTag: MetaTag | string) => void;
  onSelectedMetaTagsChange?: (selectedIds: string[]) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
}

const ActionMenu = ({ 
  metaTag, 
  onViewDetails
}: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 176; // w-44 = 11rem = 176px
      const dropdownHeight = 40 + 16; // Approximate height for one action
      
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

  const handleViewDetailsClick = () => {
    onViewDetails?.(metaTag);
    setIsOpen(false);
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
            <button
              onClick={handleViewDetailsClick}
              className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 mr-3 text-blue-600" />
              <span className="text-gray-700">View Details</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const MetaTagsTable = ({ 
  metaTags, 
  onViewDetails, 
  onSelectedMetaTagsChange,
  onBulkDelete 
}: MetaTagsTableProps) => {
  const [selectedMetaTags, setSelectedMetaTags] = useState<string[]>([]);

  // Format date to match the image format (Jun 25, 2025)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Truncate text for description
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Check if all meta tags are selected
  const isAllSelected = metaTags.length > 0 && selectedMetaTags.length === metaTags.length;
  
  // Check if some meta tags are selected (for indeterminate state)
  const isIndeterminate = selectedMetaTags.length > 0 && selectedMetaTags.length < metaTags.length;

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      setSelectedMetaTags([]);
      onSelectedMetaTagsChange?.([]);
    } else {
      // Select all
      const allIds = metaTags.map(metaTag => metaTag._id);
      setSelectedMetaTags(allIds);
      onSelectedMetaTagsChange?.(allIds);
    }
  };

  // Handle individual checkbox
  const handleSelectMetaTag = (metaTagId: string) => {
    const newSelection = selectedMetaTags.includes(metaTagId)
      ? selectedMetaTags.filter(id => id !== metaTagId)
      : [...selectedMetaTags, metaTagId];
    
    setSelectedMetaTags(newSelection);
    onSelectedMetaTagsChange?.(newSelection);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedMetaTags.length > 0 && onBulkDelete) {
      onBulkDelete(selectedMetaTags);
      setSelectedMetaTags([]);
      onSelectedMetaTagsChange?.([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedMetaTags.length > 0 && (
        <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-xs md:text-sm font-medium text-blue-800">
            {selectedMetaTags.length} meta tag{selectedMetaTags.length > 1 ? 's' : ''} selected
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
                  <span>Sr no.</span>
                </div>
              </th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Page Name</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Meta Title</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Description</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Last Updated Date</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {metaTags.map((metaTag, index) => (
              <tr key={metaTag._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* Sr no. with checkbox */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <input 
                      type="checkbox" 
                      checked={selectedMetaTags.includes(metaTag._id)}
                      onChange={() => handleSelectMetaTag(metaTag._id)}
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs md:text-sm font-medium text-gray-900">
                      #{index + 1}
                    </span>
                  </div>
                </td>

                {/* Page Name */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {metaTag.pageName}
                    </span>
                  </div>
                </td>

                {/* Meta Title */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {metaTag.metaTitle}
                    </span>
                  </div>
                </td>

                {/* Description */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      {truncateText(metaTag.metaDescription, 60)}
                    </span>
                  </div>
                </td>

                {/* Last Updated Date */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-600">
                    {formatDate(metaTag.lastUpdatedDate)}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <ActionMenu
                    metaTag={metaTag}
                    onViewDetails={onViewDetails}
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

export default MetaTagsTable; 