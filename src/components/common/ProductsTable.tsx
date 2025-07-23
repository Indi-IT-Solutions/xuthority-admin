import { useState } from 'react';
import { Star, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { VendorProduct } from '@/services/vendorService';

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

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      color: 'text-blue-600',
      onClick: () => onViewDetails?.(product._id)
    },
    {
      label: 'Delete',
      icon: Trash2,
      color: 'text-red-600',
      onClick: () => onDeleteProduct?.(product._id)
    }
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 md:p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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
                    <input 
                      type="checkbox" 
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleSelectProduct(product._id)}
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs md:text-sm font-medium text-gray-900">
                      #{product.id}
                    </span>
                  </div>
                </td>

                {/* Product Name with Logo */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {product.logo ? (
                        <img 
                          src={product.logo} 
                          alt={product.name} 
                          className="w-6 h-6 md:w-8 md:h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {product.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs md:text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </span>
                  </div>
                </td>

                {/* Market Segments */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-700">
                    {product.marketSegments || 'Not specified'}
                  </span>
                </td>

                {/* Industry */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-700">
                    {product.industry}
                  </span>
                </td>

                {/* Average Rating */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  {product.avgRating > 0 ? renderStars(product.avgRating) : (
                    <span className="text-xs md:text-sm text-gray-500">No ratings</span>
                  )}
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