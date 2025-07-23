import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { SuspenseLoader } from "@/components/common";

// Lazy load components for better performance
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const UsersPage = lazy(() => import("@/pages/admin/UsersPage"));
const VendorsPage = lazy(() => import("@/pages/admin/VendorsPage"));
const VendorDetailPage = lazy(() => import("@/pages/admin/VendorDetailPage"));
const UserDetailPage = lazy(() => import("@/pages/admin/UserDetailPage"));
const ProductsPage = lazy(() => import("@/pages/admin/ProductsPage"));
const ReviewsPage = lazy(() => import("@/pages/admin/ReviewsPage"));
const SettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));
const ProfilePage = lazy(() => import("@/pages/admin/ProfilePage"));

const Loader = () => <SuspenseLoader text="Loading page..." minTime={800} />;
// Suspense wrapper component
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loader />}>{children}</Suspense>
);

const AppRoutes = createBrowserRouter([
  {
    path: "/login",
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <SuspenseWrapper>
        <ForgotPasswordPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <SuspenseWrapper>
        <ResetPasswordPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "dashboard",
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "users",
        element: (
          <SuspenseWrapper>
            <UsersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "users/:slug",
        element: (
          <SuspenseWrapper>
            <UserDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "vendors",
        element: (
          <SuspenseWrapper>
            <VendorsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "vendors/:slug",
        element: (
          <SuspenseWrapper>
            <VendorDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "products",
        element: (
          <SuspenseWrapper>
            <ProductsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "reviews",
        element: (
          <SuspenseWrapper>
            <ReviewsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "settings",
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "profile",
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "profile-settings",
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  // Root redirect to admin
  {
    path: "/",
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Xuthority Admin</h1>
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Go to Admin Panel
          </a>
        </div>
      </div>
    ),
  },
  // Fallback route
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Go to Admin Panel
          </a>
        </div>
      </div>
    ),
  },
]);

export default AppRoutes;
