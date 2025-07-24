import React from 'react';
import { UsersTable } from '@/components/common';

// Sample data for testing the action menu
const sampleUsers = [
  {
    id: 1,
    _id: '507f1f77bcf86cd799439011',
    slug: 'john-doe',
    userDetails: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: ''
    },
    reviewPosted: 5,
    approved: 4,
    pending: 1,
    disputed: 0,
    loginType: 'Normal' as const,
    joinedOn: 'Jul 17, 2025',
    status: 'Active' as const,
    lastActivity: 'Jul 17, 2025'
  },
  {
    id: 2,
    _id: '507f1f77bcf86cd799439012',
    slug: 'jane-smith',
    userDetails: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      avatar: ''
    },
    reviewPosted: 3,
    approved: 2,
    pending: 0,
    disputed: 1,
    loginType: 'Google' as const,
    joinedOn: 'Jul 16, 2025',
    status: 'Blocked' as const,
    lastActivity: 'Jul 16, 2025'
  }
];

const ActionMenuDemo: React.FC = () => {
  const handleViewDetails = (userId: string) => {
    console.log('View details for user:', userId);
  };

  const handleBlockUser = (userId: string) => {
    console.log('Block user:', userId);
  };

  const handleUnblockUser = (userId: string) => {
    console.log('Unblock user:', userId);
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Delete user:', userId);
  };

  const handleVerifyUser = (userId: string) => {
    console.log('Verify user:', userId);
  };

  const handleSelectedUsersChange = (selectedIds: string[]) => {
    console.log('Selected users:', selectedIds);
  };

  const handleBulkDelete = (selectedIds: string[]) => {
    console.log('Bulk delete users:', selectedIds);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Action Menu Demo - Fixed Table Actions
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">What's Fixed:</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✅ <strong>Fixed Positioning:</strong> Dropdown now uses `fixed` positioning instead of `absolute`</li>
            <li>✅ <strong>Smart Positioning:</strong> Automatically adjusts position to stay within viewport</li>
            <li>✅ <strong>Higher Z-Index:</strong> Uses `z-50` to ensure dropdown appears above all content</li>
            <li>✅ <strong>Table Overflow:</strong> Changed from `overflow-auto` to `overflow-x-auto` to prevent vertical clipping</li>
            <li>✅ <strong>Dynamic Calculation:</strong> Calculates optimal position based on button location</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-md font-medium text-gray-800">Test the Action Menu (Three Dots)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Click the three dots (⋯) in the Actions column to see the fixed dropdown menu
            </p>
          </div>
          
          <UsersTable
            users={sampleUsers}
            onViewDetails={handleViewDetails}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onDeleteUser={handleDeleteUser}
            onVerifyUser={handleVerifyUser}
            onSelectedUsersChange={handleSelectedUsersChange}
            onBulkDelete={handleBulkDelete}
          />
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-md font-semibold text-blue-800 mb-2">Testing Instructions:</h3>
          <ol className="space-y-1 text-sm text-blue-700">
            <li>1. Click the three dots (⋯) in the Actions column</li>
            <li>2. Verify the dropdown appears fully visible</li>
            <li>3. Try clicking actions near the edge of the screen</li>
            <li>4. Scroll the table horizontally and test actions</li>
            <li>5. Check that dropdown adjusts position automatically</li>
          </ol>
        </div>

        <div className="mt-4 bg-green-50 rounded-lg p-4">
          <h3 className="text-md font-semibold text-green-800 mb-2">Key Improvements:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
            <div>
              <h4 className="font-medium">Before:</h4>
              <ul className="mt-1 space-y-1">
                <li>• Dropdown cut off by table overflow</li>
                <li>• Fixed to table cell boundaries</li>
                <li>• Poor positioning on screen edges</li>
                <li>• Low z-index causing overlap issues</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">After:</h4>
              <ul className="mt-1 space-y-1">
                <li>• Dropdown always fully visible</li>
                <li>• Positioned relative to viewport</li>
                <li>• Smart edge detection and adjustment</li>
                <li>• High z-index ensures proper layering</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionMenuDemo; 