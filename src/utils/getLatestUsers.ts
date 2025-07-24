import { UserService, UserQueryParams } from '@/services/userService';

/**
 * Utility function to get the latest users (newest first)
 * @param options - Query options for fetching users
 * @returns Promise with user data or error
 */
export const getLatestUsers = async (options: {
  limit?: number;
  page?: number;
  includeStats?: boolean;
} = {}) => {
  const { limit = 10, page = 1, includeStats = true } = options;

  try {
    const params: UserQueryParams = {
      page,
      limit,
      sortBy: 'createdAt',   // Sort by creation date
      sortOrder: 'desc',     // Newest first
      role: 'user',          // Only regular users (not vendors)
    };

    const response = await UserService.getUsers(params);

    if (response.success && response.data) {
      const result = {
        success: true,
        users: response.data.users,
        pagination: response.data.pagination,
        stats: includeStats ? {
          totalUsers: response.data.pagination.total,
          currentPage: response.data.pagination.page,
          totalPages: response.data.pagination.totalPages,
          usersPerPage: response.data.pagination.limit,
          hasMoreUsers: response.data.pagination.page < response.data.pagination.totalPages
        } : undefined
      };

      return result;
    }

    throw new Error(response.message || 'Failed to fetch users');
  } catch (error) {
    console.error('Error fetching latest users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      users: [],
      pagination: null,
      stats: undefined
    };
  }
};

/**
 * Get the latest N users as a simple array
 * @param count - Number of users to fetch (default: 10)
 * @returns Promise with array of users or empty array on error
 */
export const getLatestUsersArray = async (count: number = 10) => {
  const result = await getLatestUsers({ limit: count, includeStats: false });
  return result.success ? result.users : [];
};

/**
 * Get latest users with basic filtering
 * @param options - Filtering options
 * @returns Promise with filtered user data
 */
export const getLatestUsersFiltered = async (options: {
  limit?: number;
  status?: 'approved' | 'blocked';
  loginType?: 'email' | 'google' | 'linkedin';
  isVerified?: boolean;
  search?: string;
} = {}) => {
  const { limit = 10, status, loginType, isVerified, search } = options;

  try {
    const params: UserQueryParams = {
      page: 1,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      role: 'user',
      ...(status && { status }),
      ...(loginType && { loginType }),
      ...(isVerified !== undefined && { isVerified }),
      ...(search && { search })
    };

    const response = await UserService.getUsers(params);

    if (response.success && response.data) {
      return {
        success: true,
        users: response.data.users,
        total: response.data.pagination.total,
        filters: { status, loginType, isVerified, search }
      };
    }

    throw new Error(response.message || 'Failed to fetch users');
  } catch (error) {
    console.error('Error fetching filtered users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      users: [],
      total: 0,
      filters: { status, loginType, isVerified, search }
    };
  }
};

/**
 * Get latest users for today
 * @param limit - Number of users to fetch
 * @returns Promise with today's new users
 */
export const getTodaysNewUsers = async (limit: number = 20) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const params: UserQueryParams = {
      page: 1,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      role: 'user',
      dateFrom: today.toISOString(),
      dateTo: tomorrow.toISOString()
    };

    const response = await UserService.getUsers(params);

    if (response.success && response.data) {
      return {
        success: true,
        users: response.data.users,
        count: response.data.users.length,
        date: today.toDateString()
      };
    }

    throw new Error(response.message || 'Failed to fetch today\'s users');
  } catch (error) {
    console.error('Error fetching today\'s users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      users: [],
      count: 0,
      date: today.toDateString()
    };
  }
};

// Example usage:
/*
// Basic usage - get latest 10 users
const result = await getLatestUsers();
if (result.success) {
  console.log('Latest users:', result.users);
  console.log('Total users:', result.stats?.totalUsers);
}

// Get just the users array
const users = await getLatestUsersArray(5);
console.log('Latest 5 users:', users);

// Get filtered users
const filteredResult = await getLatestUsersFiltered({
  limit: 15,
  status: 'approved',
  loginType: 'google'
});

// Get today's new users
const todaysUsers = await getTodaysNewUsers(10);
if (todaysUsers.success) {
  console.log(`${todaysUsers.count} new users joined today`);
}
*/ 