# Xuthority Admin Panel

## Environment Configuration

### Backend API Connection

The admin panel needs to connect to the backend API. Create a `.env.local` file in the root directory with:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

**Note**: Adjust the port number based on where your backend is running:
- Development: Usually `3000` (default)
- Production: Check your deployment configuration

### Troubleshooting API Connection

If you see "Badge API not available, using sample data" in the console:

1. **Check backend server**: Make sure the backend is running
2. **Verify port**: Check what port your backend is running on
3. **Check environment**: Ensure `VITE_API_BASE_URL` is set correctly
4. **CORS issues**: Make sure the backend allows requests from the admin panel origin

### Backend Server Ports

Common ports used:
- **Development**: `http://localhost:3000/api/v1` 
- **Production**: `http://localhost:8080/api/v1` or `http://localhost:8081/api/v1`

## Development Setup

### Prerequisites
- Node.js 18+
- Backend server running

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Features

### Badge Management
- View all badges with real-time "Earned by" counts
- Create, edit, and delete badges
- Manage badge requests and approvals
- Track badge statistics

### User Management
- View and manage users
- Handle user verification
- Monitor user activity

### Content Management
- Manage blog posts and resources
- Handle product reviews
- Content moderation tools

### Analytics Dashboard
- User growth charts
- Review statistics
- Badge distribution analytics

## API Integration

The admin panel integrates with the backend API for:
- Real-time data fetching
- Secure authentication
- File uploads
- Report generation

### Authentication
Uses JWT tokens stored in localStorage with automatic refresh handling.

### Error Handling
- Network errors show fallback data in development
- Production shows proper error messages
- Automatic retry for failed requests

## Deployment

### Environment Variables
Set these in your production environment:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

### Build Process
```bash
npm run build
```

The `dist` folder contains the built application ready for deployment. 