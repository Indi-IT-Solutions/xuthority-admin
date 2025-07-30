import api from './api';

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  meta?: any;
  actionUrl?: string;
  isRead: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  data: Notification[];
  meta: {
    pagination: {
      page: number;
      limit: number;
    };
    total: number;
  };
}

export interface UnreadCountResponse {
  data: {
    count: number;
  };
}

export const NotificationService = {
  // Get notifications for admin
  getNotifications: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<NotificationResponse>(`/admin/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    const response = await api.get<UnreadCountResponse>('/admin/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    const response = await api.patch(`/admin/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.patch('/admin/notifications/read-all');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    const response = await api.delete(`/admin/notifications/${notificationId}`);
    return response.data;
  },
};