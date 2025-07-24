import React from 'react';
import LatestUsersList from '@/components/LatestUsersList';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LatestUsersPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Latest Users</h1>
          <p className="text-gray-600 mt-1">View the most recently registered users</p>
        </div>
        <Button 
          onClick={() => navigate('/users')}
          variant="outline"
        >
          View All Users
        </Button>
      </div>

      {/* Latest Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest 5 Users */}
        <div>
          <LatestUsersList 
            limit={5} 
            showTitle={true}
          />
        </div>

        {/* Latest 10 Users (without title for compact view) */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Latest 10 Users (Compact View)
            </h2>
            <LatestUsersList 
              limit={10} 
              showTitle={false}
            />
          </div>
        </div>
      </div>

      {/* Additional Examples */}
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Additional Usage Examples</h2>
        
        {/* Code Examples */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Examples</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-2">1. Get Latest 5 Users:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<LatestUsersList limit={5} showTitle={true} />`}
              </pre>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-800 mb-2">2. Using the Hook Directly:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const { data: usersData, isLoading, error } = useUsers({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  role: 'user'
});`}
              </pre>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-800 mb-2">3. API Service Call:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const response = await UserService.getUsers({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  role: 'user'
});`}
              </pre>
            </div>
          </div>
        </div>

        {/* Query Parameters Explanation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Query Parameters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Pagination</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>page</code>: Page number (default: 1)</li>
                <li>• <code>limit</code>: Items per page (default: 10)</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Sorting</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>sortBy</code>: createdAt, firstName, lastName, email</li>
                <li>• <code>sortOrder</code>: asc, desc</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Filtering</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>search</code>: Search term</li>
                <li>• <code>status</code>: approved, blocked</li>
                <li>• <code>role</code>: user, vendor</li>
                <li>• <code>loginType</code>: email, google, linkedin</li>
                <li>• <code>isVerified</code>: boolean</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestUsersPage; 