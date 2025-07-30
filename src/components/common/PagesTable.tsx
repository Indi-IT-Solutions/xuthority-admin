import React, { useState } from 'react';
import { Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Page {
  _id: string;
  name: string;
  lastUpdatedDate: string;
  slug?: string;
  status?: 'active' | 'inactive';
}

interface ActionMenuProps {
  page: Page;
  onViewDetails?: (page: Page | string) => void;
}

interface PagesTableProps {
  pages: Page[];
  onViewDetails?: (page: Page | string) => void;
  onSelectedPagesChange?: (selectedIds: string[]) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
}

const ActionMenu = ({ 
  page, 
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
    onViewDetails?.(page);
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

const PagesTable = ({ 
  pages, 
  onViewDetails, 
  onSelectedPagesChange,
  onBulkDelete 
}: PagesTableProps) => {
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  // Format date to match the image format (Mar 25, 2025)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Check if all pages are selected
  const isAllSelected = pages.length > 0 && selectedPages.length === pages.length;
  
  // Check if some pages are selected (for indeterminate state)
  const isIndeterminate = selectedPages.length > 0 && selectedPages.length < pages.length;

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      setSelectedPages([]);
      onSelectedPagesChange?.([]);
    } else {
      // Select all
      const allIds = pages.map(page => page._id);
      setSelectedPages(allIds);
      onSelectedPagesChange?.(allIds);
    }
  };

  // Handle individual checkbox
  const handleSelectPage = (pageId: string) => {
    const newSelection = selectedPages.includes(pageId)
      ? selectedPages.filter(id => id !== pageId)
      : [...selectedPages, pageId];
    
    setSelectedPages(newSelection);
    onSelectedPagesChange?.(newSelection);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedPages.length > 0 && onBulkDelete) {
      onBulkDelete(selectedPages);
      setSelectedPages([]);
      onSelectedPagesChange?.([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedPages.length > 0 && (
        <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-xs md:text-sm font-medium text-blue-800">
            {selectedPages.length} page{selectedPages.length > 1 ? 's' : ''} selected
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
                  <span>S. No.</span>
                </div>
              </th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Page Name</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Last Updated Date</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {pages.map((page, index) => (
              <tr key={page._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* S. No. with checkbox */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <input 
                      type="checkbox" 
                      checked={selectedPages.includes(page._id)}
                      onChange={() => handleSelectPage(page._id)}
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
                      {page.name}
                    </span>
                  </div>
                </td>

                {/* Last Updated Date */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-600">
                    {formatDate(page.lastUpdatedDate)}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <ActionMenu
                    page={page}
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

export default PagesTable; 