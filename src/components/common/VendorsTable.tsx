import React, { useState } from 'react';
import { MoreHorizontal, Eye, Trash2, Check, X, Ban } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/utils/getInitials';

interface Vendor {
  id: number;
  _id?: string; // Add the actual MongoDB ID for API calls
  company: {
    name: string;
    email: string;
    logo: string;
  };
  owner: {
    name: string;
    email: string;
    avatar: string;
  };
  industry: string;
  companySize: string;
  joinedOn: string;
  status: 'Active' | 'Blocked' | 'Pending';
}

interface VendorsTableProps {
  vendors: Vendor[];
  onViewDetails?: (vendorId: string) => void;
  onBlockVendor?: (vendorId: string) => void;
  onUnblockVendor?: (vendorId: string) => void;
  onApproveVendor?: (vendorId: string) => void;
  onRejectVendor?: (vendorId: string) => void;
  onDeleteVendor?: (vendorId: string) => void;
  onSelectedVendorsChange?: (selectedIds: string[]) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
}

interface ActionMenuProps {
  vendor: Vendor;
  onViewDetails?: (vendorId: string) => void;
  onBlockVendor?: (vendorId: string) => void;
  onUnblockVendor?: (vendorId: string) => void;
  onApproveVendor?: (vendorId: string) => void;
  onRejectVendor?: (vendorId: string) => void;
  onDeleteVendor?: (vendorId: string) => void;
}

const ActionMenu = ({ 
  vendor, 
  onViewDetails, 
  onBlockVendor, 
  onUnblockVendor,
  onApproveVendor,
  onRejectVendor,
}: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const getActions = () => {
    switch (vendor.status) {
      case 'Active':
        return [
          {
            label: 'View Details',
            icon: Eye,
            color: 'text-blue-600',
            onClick: () => onViewDetails?.(vendor._id || vendor.id.toString())
          },
          {
            label: 'Block Vendor',
            icon: Ban,
            color: 'text-red-600',
            onClick: () => onBlockVendor?.(vendor._id || vendor.id.toString())
          },
     
        ];
      case 'Blocked':
        return [
          {
            label: 'View Details',
            icon: Eye,
            color: 'text-blue-600',
            onClick: () => onViewDetails?.(vendor._id || vendor.id.toString())
          },
          {
            label: 'Unblock',
            icon: Check,
            color: 'text-green-600',
            onClick: () => onUnblockVendor?.(vendor._id || vendor.id.toString())
          },
      
        ];
      case 'Pending':
        return [
          {
            label: 'View Details',
            icon: Eye,
            color: 'text-blue-600',
            onClick: () => onViewDetails?.(vendor._id || vendor.id.toString())
          },
          {
            label: 'Approve',
            icon: Check,
            color: 'text-green-600',
            onClick: () => onApproveVendor?.(vendor._id || vendor.id.toString())
          },
          {
            label: 'Reject',
            icon: X,
            color: 'text-red-600',
            onClick: () => onRejectVendor?.(vendor._id || vendor.id.toString())
          }
        ];
      default:
        return [];
    }
  };

  const actions = getActions();

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 176; // w-44 = 11rem = 176px
      const dropdownHeight = 200; // Approximate height for vendor actions
      
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

const VendorsTable = ({ 
  vendors, 
  onViewDetails, 
  onBlockVendor,
  onUnblockVendor,
  onApproveVendor,
  onRejectVendor,
  onDeleteVendor,
  onSelectedVendorsChange,
  onBulkDelete 
}: VendorsTableProps) => {
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium";
    
    switch (status) {
      case 'Active':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'Blocked':
        return `${baseClasses} bg-red-100 text-red-700`;
      case 'Pending':
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  // Check if all vendors are selected
  const isAllSelected = vendors.length > 0 && selectedVendors.length === vendors.length;
  
  // Check if some vendors are selected (for indeterminate state)
  const isIndeterminate = selectedVendors.length > 0 && selectedVendors.length < vendors.length;

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      setSelectedVendors([]);
      onSelectedVendorsChange?.([]);
    } else {
      // Select all
      const allIds = vendors.map(vendor => vendor._id || vendor.id.toString());
      setSelectedVendors(allIds);
      onSelectedVendorsChange?.(allIds);
    }
  };

  // Handle individual checkbox
  const handleSelectVendor = (vendorId: string) => {
    const newSelection = selectedVendors.includes(vendorId)
      ? selectedVendors.filter(id => id !== vendorId)
      : [...selectedVendors, vendorId];
    
    setSelectedVendors(newSelection);
    onSelectedVendorsChange?.(newSelection);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedVendors.length > 0 && onBulkDelete) {
      onBulkDelete(selectedVendors);
      setSelectedVendors([]);
      onSelectedVendorsChange?.([]);
    }
  };

  return (
    <div >
      {/* Bulk Delete Button */}
      {selectedVendors.length > 0 && (
        <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-xs md:text-sm font-medium text-blue-800">
            {selectedVendors.length} user{selectedVendors.length > 1 ? 's' : ''} selected
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
      <div className="overflow-auto gap-3  rounded-2xl bg-white shadow-sm border border-gray-100 min-h-[65vh]">
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
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Company Details</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Owner Details</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Industry</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Company Size</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Joined On</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody >
            {vendors.map((vendor, index) => (
              <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* S. No. with checkbox */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <input 
                      type="checkbox" 
                      checked={selectedVendors.includes(vendor._id || vendor.id.toString())}
                      onChange={() => handleSelectVendor(vendor._id || vendor.id.toString())}
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs md:text-sm font-medium text-gray-900">
                      #{index + 1}
                    </span>
                  </div>
                </td>

                {/* Company Details */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {vendor.company.logo ? (
                        <img 
                          src={vendor.company.logo} 
                          alt={vendor.company.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs md:text-sm font-semibold text-gray-600">
                          {getInitials(vendor.company.name)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs md:text-sm font-medium text-gray-900 truncate">
                        {vendor.company.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {vendor.company.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Owner Details */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                      <AvatarImage 
                        src={vendor.owner.avatar} 
                        alt={vendor.owner.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs md:text-sm font-semibold">
                        {getInitials(vendor.owner.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-xs md:text-sm font-medium text-gray-900 truncate">
                        {vendor.owner.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {vendor.owner.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Industry */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-900">{vendor.industry}</span>
                </td>

                {/* Company Size */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-900">{vendor.companySize}</span>
                </td>

                {/* Joined On */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">{vendor.joinedOn}</span>
                </td>

                {/* Status */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className={getStatusBadge(vendor.status)}>
                    {vendor.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <ActionMenu 
                    vendor={vendor}
                    onViewDetails={onViewDetails}
                    onBlockVendor={onBlockVendor}
                    onUnblockVendor={onUnblockVendor}
                    onApproveVendor={onApproveVendor}
                    onRejectVendor={onRejectVendor}
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

export default VendorsTable; 