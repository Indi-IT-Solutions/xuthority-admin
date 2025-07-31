import { renderHook } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useNotificationNavigation } from './notificationNavigation';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('useNotificationNavigation', () => {
  const mockNavigate = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to users page for USER_REGISTRATION', () => {
    const { result } = renderHook(() => useNotificationNavigation());
    
    const notification = {
      _id: '1',
      type: 'USER_REGISTRATION',
      title: 'New User Joined',
      message: 'A new user has registered',
      isRead: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    result.current.handleNotificationClick(notification);
    
    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });

  it('should navigate to vendors page for VENDOR_REGISTRATION', () => {
    const { result } = renderHook(() => useNotificationNavigation());
    
    const notification = {
      _id: '1',
      type: 'VENDOR_REGISTRATION',
      title: 'New Vendor Application',
      message: 'A new vendor has registered',
      isRead: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    result.current.handleNotificationClick(notification);
    
    expect(mockNavigate).toHaveBeenCalledWith('/vendors');
  });

  it('should navigate to reviews page for PRODUCT_REVIEW', () => {
    const { result } = renderHook(() => useNotificationNavigation());
    
    const notification = {
      _id: '1',
      type: 'PRODUCT_REVIEW',
      title: 'New Review Received',
      message: 'A new review has been posted',
      isRead: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    result.current.handleNotificationClick(notification);
    
    expect(mockNavigate).toHaveBeenCalledWith('/reviews');
  });

  it('should navigate to badges page for BADGE_REQUEST', () => {
    const { result } = renderHook(() => useNotificationNavigation());
    
    const notification = {
      _id: '1',
      type: 'BADGE_REQUEST',
      title: 'New Badge Request',
      message: 'A new badge request has been submitted',
      isRead: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    result.current.handleNotificationClick(notification);
    
    expect(mockNavigate).toHaveBeenCalledWith('/badges');
  });

  it('should navigate to dashboard for payment notifications', () => {
    const { result } = renderHook(() => useNotificationNavigation());
    
    const notification = {
      _id: '1',
      type: 'PAYMENT_SUCCESS',
      title: 'Payment Received',
      message: 'A payment has been received',
      isRead: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    result.current.handleNotificationClick(notification);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should call onClose callback when provided', () => {
    const { result } = renderHook(() => useNotificationNavigation());
    
    const notification = {
      _id: '1',
      type: 'USER_REGISTRATION',
      title: 'New User Joined',
      message: 'A new user has registered',
      isRead: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    result.current.handleNotificationClick(notification, mockOnClose);
    
    expect(mockNavigate).toHaveBeenCalledWith('/users');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not call onClose callback when not provided', () => {
    const { result } = renderHook(() => useNotificationNavigation());
    
    const notification = {
      _id: '1',
      type: 'USER_REGISTRATION',
      title: 'New User Joined',
      message: 'A new user has registered',
      isRead: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    result.current.handleNotificationClick(notification);
    
    expect(mockNavigate).toHaveBeenCalledWith('/users');
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should navigate to dashboard for unknown notification types', () => {
    const { result } = renderHook(() => useNotificationNavigation());
    
    const notification = {
      _id: '1',
      type: 'UNKNOWN_TYPE',
      title: 'Unknown Notification',
      message: 'An unknown notification',
      isRead: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    result.current.handleNotificationClick(notification);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should ignore actionUrl and always use type-based navigation', () => {
    const { result } = renderHook(() => useNotificationNavigation());
    
    const notification = {
      _id: '1',
      type: 'USER_REGISTRATION',
      title: 'New User Joined',
      message: 'A new user has registered',
      actionUrl: 'users/123', // This should be ignored
      isRead: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    result.current.handleNotificationClick(notification);
    
    // Should navigate to /users, not /users/123
    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });
}); 