import { useNavigate } from 'react-router-dom';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  meta?: any;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useNotificationNavigation = () => {
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification, onClose?: () => void) => {
    // Always navigate to general route pages (without IDs)
    switch (notification.type) {
      case 'USER_REGISTRATION':
        navigate('/users');
        break;
      
      case 'VENDOR_REGISTRATION':
        navigate('/vendors');
        break;
      
      case 'PRODUCT_REVIEW':
        navigate('/reviews');
        break;
      
      case 'BADGE_REQUEST':
        navigate('/badges');
        break;
      
      case 'PAYMENT_SUCCESS':
      case 'PAYMENT_FAILED':
        navigate('/');
        break;
      
      case 'DISPUTE_CREATED':
      case 'DISPUTE_RESOLVED':
        navigate('/');
        break;
      case 'CONTACT_TICKET_CREATED':
        navigate('/helpdesk');
        break;
      case 'PRODUCT_CREATED':
        navigate('/products');
        break;
      case 'PRODUCT_UPDATE_PENDING':
        navigate('/products');
        break;
      case 'PRODUCT_RESUBMITTED':
        navigate('/products');
        break;
      case 'PRODUCT_UPDATE_REJECTED':
        navigate('/products');
        break;
      default:
        navigate('/');
        break;
    }

    // Close the notification sidebar if callback is provided
    if (onClose) {
      onClose();
    }
  };

  return { handleNotificationClick };
}; 