# Xuthority Admin

A modern, responsive admin panel for managing the Xuthority platform. Built with React, TypeScript, Tailwind CSS, and modern web technologies.

## 🚀 Features

- **Modern UI/UX**: Clean, professional interface built with Tailwind CSS and Radix UI components
- **Authentication**: Secure admin login with JWT token management
- **Dashboard**: Comprehensive overview with statistics and recent activities
- **User Management**: View, search, and manage users with role-based permissions
- **Product Management**: Monitor and approve product listings
- **Review Moderation**: Track and moderate user reviews
- **Responsive Design**: Fully responsive layout that works on all devices
- **Dark/Light Mode Ready**: Built with CSS variables for easy theming
- **Type Safety**: Full TypeScript implementation for better development experience

## 🛠️ Tech Stack

- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Zustand** - Global state management
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation
- **Lucide React** - Beautiful icons

## 📁 Project Structure

```
xuthority-admin/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components (Button, Input, etc.)
│   │   ├── layout/        # Layout components (Sidebar, Header)
│   │   ├── common/        # Common components
│   │   └── admin/         # Admin-specific components
│   ├── features/          # Feature-based modules
│   │   ├── auth/          # Authentication features
│   │   └── admin/         # Admin management features
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin panel pages
│   │   └── auth/          # Authentication pages
│   ├── routes/            # Routing configuration
│   ├── services/          # API service layer
│   ├── store/             # Global state management
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── config/            # Configuration files
├── package.json
├── vite.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to the Xuthority backend API

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xuthority-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit `http://localhost:5173` to see the admin panel

### Default Login Credentials

For development/demo purposes:
- **Email**: admin@xuthority.com
- **Password**: admin123

## 🏗️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 UI Components

The admin panel uses a consistent design system built with:

- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible, unstyled components
- **Custom color palette** with admin-specific branding
- **Responsive breakpoints** for mobile, tablet, and desktop
- **Animation utilities** for smooth transitions

### Key Components

- `Button` - Various button styles and sizes
- `Card` - Container component for content sections
- `Input` - Form input fields with validation states
- `Badge` - Status indicators and labels
- `DropdownMenu` - Accessible dropdown menus
- `Dialog` - Modal dialogs and overlays

## 🔐 Authentication & Security

- **JWT Token Management**: Secure token storage and automatic refresh
- **Route Protection**: Private routes require authentication
- **Role-Based Access**: Different permission levels for admin users
- **Automatic Logout**: Session timeout and unauthorized access handling

## 📊 State Management

### Zustand Stores

- **Admin Store** (`useAdminStore`): Authentication and user state
- **UI Store**: Application UI state (sidebar, theme, etc.)

### React Query

- **Server State**: API data caching and synchronization
- **Automatic Refetching**: Background updates and error handling
- **Optimistic Updates**: Immediate UI feedback

## 🎯 Features Overview

### Dashboard
- Platform statistics and KPIs
- Recent user registrations
- Latest reviews and ratings
- Quick access to common actions

### User Management
- User listing with search and filters
- Role assignment and permissions
- Account status management
- Activity monitoring

### Product Management
- Product approval workflow
- Category and tag management
- Content moderation
- Analytics and reporting

### Review Moderation
- Review approval/rejection
- Spam detection and filtering
- Quality scoring
- User feedback management

### Settings
- Platform configuration
- Admin preferences
- System information
- Environment variables

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow React hooks patterns
- Implement proper error boundaries
- Use semantic HTML and ARIA labels
- Follow Tailwind CSS conventions

### Component Structure
```typescript
// Component template
import { FC } from 'react';
import { ComponentProps } from '@/types';

interface ExampleComponentProps extends ComponentProps {
  title: string;
  onAction: () => void;
}

const ExampleComponent: FC<ExampleComponentProps> = ({ 
  title, 
  onAction, 
  className 
}) => {
  return (
    <div className={cn('base-styles', className)}>
      {/* Component content */}
    </div>
  );
};

export default ExampleComponent;
```

### API Integration
- Use React Query for all API calls
- Implement proper error handling
- Add loading states for better UX
- Cache data appropriately

## 📱 Responsive Design

The admin panel is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

Key responsive features:
- Collapsible sidebar on mobile
- Stacked card layouts on smaller screens
- Touch-friendly interactive elements
- Optimized typography scales

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Set these environment variables for production:
```env
VITE_API_URL=https://api.xuthority.com
```

### Deployment Options
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **AWS S3 + CloudFront**: Scalable hosting
- **Docker**: Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the Xuthority platform** 