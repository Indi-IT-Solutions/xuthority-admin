# Latest Users Guide

This guide explains how to get the latest user list (newest users first) in the Xuthority Admin panel.

## Quick Start

### 1. Using the Component (Recommended)

The simplest way to display latest users is using the `LatestUsersList` component:

```tsx
import LatestUsersList from '@/components/LatestUsersList';

// Basic usage - shows latest 10 users
<LatestUsersList />

// Custom limit - shows latest 5 users
<LatestUsersList limit={5} />

// Without title
<LatestUsersList limit={10} showTitle={false} />
```

### 2. Using the Hook

For more control in React components:

```tsx
import { useUsers } from '@/hooks/useUsers';

const MyComponent = () => {
  const { data: usersData, isLoading, error } = useUsers({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    role: 'user'
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {usersData?.users.map(user => (
        <div key={user._id}>{user.userDetails.name}</div>
      ))}
    </div>
  );
};
```

### 3. Using Utility Functions

For direct API calls without React hooks:

```tsx
import { getLatestUsers, getLatestUsersArray } from '@/utils/getLatestUsers';

// Get latest users with full response
const result = await getLatestUsers({ limit: 10 });
if (result.success) {
  console.log('Users:', result.users);
  console.log('Total:', result.stats?.totalUsers);
}

// Get just the users array
const users = await getLatestUsersArray(5);
console.log('Latest 5 users:', users);
```

## Available Methods

### 1. React Component: `LatestUsersList`

```tsx
interface LatestUsersListProps {
  limit?: number;        // Number of users to show (default: 10)
  showTitle?: boolean;   // Show/hide title (default: true)
}
```

**Example:**
```tsx
<LatestUsersList limit={15} showTitle={true} />
```

### 2. React Hook: `useUsers`

```tsx
const { data, isLoading, error } = useUsers({
  page: 1,              // Page number
  limit: 10,            // Users per page
  sortBy: 'createdAt',  // Sort field
  sortOrder: 'desc',    // Sort direction (desc = newest first)
  role: 'user',         // User type
  // Optional filters:
  status: 'approved',   // User status
  search: 'john',       // Search term
  loginType: 'google',  // Login method
  isVerified: true      // Verification status
});
```

### 3. Service Method: `UserService.getUsers`

```tsx
import { UserService } from '@/services/userService';

const response = await UserService.getUsers({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  role: 'user'
});

if (response.success) {
  const users = response.data.users;
  const pagination = response.data.pagination;
}
```

### 4. Utility Functions

#### Basic Usage
```tsx
import { getLatestUsers } from '@/utils/getLatestUsers';

const result = await getLatestUsers({
  limit: 10,
  page: 1,
  includeStats: true
});
```

#### Simple Array
```tsx
import { getLatestUsersArray } from '@/utils/getLatestUsers';

const users = await getLatestUsersArray(5);
```

#### Filtered Users
```tsx
import { getLatestUsersFiltered } from '@/utils/getLatestUsers';

const result = await getLatestUsersFiltered({
  limit: 10,
  status: 'approved',
  loginType: 'google',
  isVerified: true,
  search: 'john'
});
```

#### Today's New Users
```tsx
import { getTodaysNewUsers } from '@/utils/getLatestUsers';

const todaysUsers = await getTodaysNewUsers(20);
console.log(`${todaysUsers.count} users joined today`);
```

## Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Sorting
- `sortBy`: Field to sort by
  - `'createdAt'` - Registration date (recommended for latest users)
  - `'firstName'` - First name
  - `'lastName'` - Last name
  - `'email'` - Email address
- `sortOrder`: Sort direction
  - `'desc'` - Descending (newest first) ✅ **Use this for latest users**
  - `'asc'` - Ascending (oldest first)

### Filtering
- `search`: Search term (searches name, email)
- `role`: User type
  - `'user'` - Regular users ✅ **Recommended**
  - `'vendor'` - Vendor accounts
- `status`: Account status
  - `'approved'` - Active users
  - `'blocked'` - Blocked users
- `loginType`: Authentication method
  - `'email'` - Email/password
  - `'google'` - Google OAuth
  - `'linkedin'` - LinkedIn OAuth
- `isVerified`: Email verification status (boolean)

### Date Filtering
- `period`: Predefined periods
  - `'weekly'` - Last 7 days
  - `'monthly'` - Last 30 days
  - `'yearly'` - Last 365 days
- `dateFrom`: Custom start date (ISO string)
- `dateTo`: Custom end date (ISO string)

## Examples

### 1. Dashboard Widget - Latest 5 Users
```tsx
import LatestUsersList from '@/components/LatestUsersList';

const DashboardWidget = () => (
  <div className="dashboard-widget">
    <LatestUsersList limit={5} />
  </div>
);
```

### 2. Admin Page - Latest Users with Filters
```tsx
import { useUsers } from '@/hooks/useUsers';

const AdminUsersPage = () => {
  const { data, isLoading } = useUsers({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    role: 'user',
    status: 'approved'
  });

  return (
    <div>
      <h1>Latest Approved Users</h1>
      {/* Render users... */}
    </div>
  );
};
```

### 3. API Integration - Today's Registrations
```tsx
import { getTodaysNewUsers } from '@/utils/getLatestUsers';

const checkTodaysRegistrations = async () => {
  const result = await getTodaysNewUsers(50);
  
  if (result.success) {
    console.log(`${result.count} new users registered today`);
    result.users.forEach(user => {
      console.log(`- ${user.userDetails.name} (${user.userDetails.email})`);
    });
  }
};
```

### 4. Filtered Search - Google Users from Last Week
```tsx
import { useUsers } from '@/hooks/useUsers';

const GoogleUsersThisWeek = () => {
  const { data } = useUsers({
    page: 1,
    limit: 15,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    role: 'user',
    loginType: 'google',
    period: 'weekly'
  });

  return (
    <div>
      <h2>Google Users (Last 7 days)</h2>
      {/* Render users... */}
    </div>
  );
};
```

## Response Format

All methods return user data in this format:

```typescript
interface User {
  id: number;              // Display ID
  _id: string;             // MongoDB ID
  slug: string;            // URL slug
  userDetails: {
    name: string;          // Full name
    email: string;         // Email address
    avatar: string;        // Avatar URL
  };
  reviewPosted: number;    // Number of reviews
  approved: number;        // Approved reviews
  pending: number;         // Pending reviews
  disputed: number;        // Disputed reviews
  loginType: string;       // Login method
  joinedOn: string;        // Registration date (formatted)
  status: string;          // Account status
  lastActivity: string;    // Last activity date
}

interface Pagination {
  page: number;            // Current page
  limit: number;           // Items per page
  total: number;           // Total items
  totalPages: number;      // Total pages
}
```

## Best Practices

1. **Use `LatestUsersList` component** for quick display needs
2. **Use `useUsers` hook** for custom React components
3. **Use utility functions** for non-React contexts
4. **Always sort by `createdAt` desc** for latest users
5. **Filter by `role: 'user'`** to exclude vendors
6. **Handle loading and error states** properly
7. **Use appropriate page limits** (10-20 for lists, 5 for widgets)

## Error Handling

```tsx
const { data, isLoading, error } = useUsers({...});

if (isLoading) {
  return <div>Loading latest users...</div>;
}

if (error) {
  return <div>Error loading users: {error.message}</div>;
}

if (!data || data.users.length === 0) {
  return <div>No users found</div>;
}

// Render users...
```

## Performance Tips

1. **Use pagination** instead of loading all users
2. **Set appropriate `staleTime`** for caching (5 minutes default)
3. **Debounce search queries** to avoid excessive API calls
4. **Use `React.memo`** for user list items if needed
5. **Consider virtual scrolling** for very long lists

## File Locations

- Component: `src/components/LatestUsersList.tsx`
- Hook: `src/hooks/useUsers.ts`
- Service: `src/services/userService.ts`
- Utils: `src/utils/getLatestUsers.ts`
- Demo Page: `src/pages/admin/LatestUsersPage.tsx` 