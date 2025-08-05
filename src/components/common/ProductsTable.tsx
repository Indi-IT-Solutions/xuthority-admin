import React, { useState } from 'react';
import { Star, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { VendorProduct } from '@/services/vendorService';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import StarRatingSingle from '../ui/StarRatingSingle';

interface ProductsTableProps {
  products: VendorProduct[];
  onViewDetails?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
  onSelectedProductsChange?: (selectedIds: string[]) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
}

interface ActionMenuProps {
  product: VendorProduct;
  onViewDetails?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
}

const ActionMenu = ({ 
  product, 
  onViewDetails, 
  onDeleteProduct
}: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      color: 'text-blue-600',
      onClick: () => onViewDetails?.(product.slug)
    },
    // {
    //   label: 'Delete',
    //   icon: Trash2,
    //   color: 'text-red-600',
    //   onClick: () => onDeleteProduct?.(product._id)
    // }
  ];

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 176; // w-44 = 11rem = 176px
      const dropdownHeight = 120; // Approximate height for product actions
      
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

const ProductsTable = ({ 
  products, 
  onViewDetails, 
  onDeleteProduct,
  onSelectedProductsChange,
  onBulkDelete 
}: ProductsTableProps) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
console.log('products', products)
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <StarRatingSingle rating={rating}/>
        <span className="text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  // Check if all products are selected
  const isAllSelected = products.length > 0 && selectedProducts.length === products.length;
  
  // Check if some products are selected (for indeterminate state)
  const isIndeterminate = selectedProducts.length > 0 && selectedProducts.length < products.length;

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      setSelectedProducts([]);
      onSelectedProductsChange?.([]);
    } else {
      // Select all
      const allIds = products.map(product => product._id);
      setSelectedProducts(allIds);
      onSelectedProductsChange?.(allIds);
    }
  };

  // Handle individual checkbox
  const handleSelectProduct = (productId: string) => {
    const newSelection = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    
    setSelectedProducts(newSelection);
    onSelectedProductsChange?.(newSelection);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedProducts.length > 0 && onBulkDelete) {
      onBulkDelete(selectedProducts);
      setSelectedProducts([]);
      onSelectedProductsChange?.([]);
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between gap-3 ">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold text-gray-900">Product List</h3>
        </div>
      </div>

      {/* Bulk Delete Button */}
      {selectedProducts.length > 0 && (
        <div className='flex items-center gap-2 self-end w-full justify-end my-4'>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-500 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
            Delete ({selectedProducts.length})
          </button>
        </div>
      )}

              {/* Table */}
        <div className="overflow-x-auto my-4 rounded-xl lg:rounded-2xl">
          <table className="w-full min-w-[800px] lg:min-w-[1200px]">
          {/* Table Header */}
          <thead className="bg-gray-100 rounded-b-2xl">
            <tr>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600 min-w-[80px]">
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
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Product Name</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Market Segments</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Industry</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Avg. Rating</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Total Reviews</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Created On</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {products.map((product, index) => (
              <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* S. No. with checkbox */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    {/* <input 
                      type="checkbox" 
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleSelectProduct(product._id)}
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    /> */}
                    <span className="text-xs md:text-sm font-medium text-gray-900">
                    #{index + 1}
                    </span>
                  </div>
                </td>

                {/* Product Name with Logo */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12 sm:w-14 sm:h-14 rounded-md text-white flex-shrink-0 flex  justify-center items-center" style={{backgroundColor: product?.brandColors }}>
                <AvatarImage src={product?.logoUrl} alt={product?.name} className="object-cover h-12 w-12 rounded-md"/>
                <AvatarFallback>
                  {product?.name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
        
                    <span className="text-xs md:text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </span>
                  </div>
            
                </td>

                {/* Market Segments */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-700 line-clamp-2">
                    {(() => {
                      if (product.marketSegments) {
                        return product.marketSegments;
                      }
                      if (product.marketSegment && Array.isArray(product.marketSegment)) {
                        // Handle array of objects with name property
                        if (product.marketSegment.length > 0 && typeof product.marketSegment[0] === 'object' && product.marketSegment[0] && 'name' in product.marketSegment[0]) {
                          return product.marketSegment.map((segment: any) => segment.name).join(', ');
                        }
                        // Handle array of strings
                        return product.marketSegment.join(', ');
                      }
                      return '-';
                    })()}
                  </span>
                </td>

                {/* Industry */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-700 line-clamp-2">
                    {(() => {
                      if (product.industry) {
                        return product.industry;
                      }
                      if (product.industries && Array.isArray(product.industries)) {
                        // Handle array of objects with name property
                        if (product.industries.length > 0 && typeof product.industries[0] === 'object' && product.industries[0] && 'name' in product.industries[0]) {
                          return product.industries.map((industry: any) => industry.name).join(', ');
                        }
                        // Handle array of strings
                        return product.industries.join(', ');
                      }
                      return '-';
                    })()}
                  </span>
                </td>

                {/* Average Rating */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  {renderStars(product.avgRating)}
                </td>

                {/* Total Reviews */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm font-medium text-gray-900">
                    {product.totalReviews}
                  </span>
                </td>

                {/* Created On */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-700">
                    {formatDate(product.createdAt)}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <ActionMenu 
                    product={product}
                    onViewDetails={onViewDetails}
                    onDeleteProduct={onDeleteProduct}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm md:text-base">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsTable; 