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
const BadgesPage = lazy(() => import("@/pages/admin/BadgesPage"));
const ReviewsPage = lazy(() => import("@/pages/admin/ReviewsPage"));
const ReviewDetailPage = lazy(() => import("@/pages/admin/ReviewDetailPage"));
const SettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));
const ProfilePage = lazy(() => import("@/pages/admin/ProfilePage"));
const ResourceCenterPage = lazy(() => import("@/pages/admin/ResourceCenterPage"));
const AddResourcePage = lazy(() => import("@/pages/admin/AddResourcePage"));
const EditResourcePage = lazy(() => import("@/pages/admin/EditResourcePage"));
const ResourceDetailPage = lazy(() => import("@/pages/admin/ResourceDetailPage"));
const EditBadgePage = lazy(() => import("@/pages/admin/EditBadgePage"));
const AddBadgePage = lazy(() => import("@/pages/admin/AddBadgePage"));
const PagesPage = lazy(() => import("@/pages/admin/PagesPage"));
const PageDetailsPage = lazy(() => import("@/pages/admin/PageDetailsPage"));
const PageViewPage = lazy(() => import("@/pages/admin/PageViewPage"));
const LandingPagesPage = lazy(() => import("@/pages/admin/LandingPagesPage"));
const MetaTagsPage = lazy(() => import("@/pages/admin/MetaTagsPage"));
const MetaTagEditPage = lazy(() => import("@/pages/admin/MetaTagEditPage"));

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
        path: "badges",
        element: (
          <SuspenseWrapper>
            <BadgesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "badges/edit/:id",
        element: (
          <SuspenseWrapper>
            <EditBadgePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "badges/add",
        element: (
          <SuspenseWrapper>
            <AddBadgePage />
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
        path: "reviews/:id",
        element: (
          <SuspenseWrapper>
            <ReviewDetailPage />
          </SuspenseWrapper>
        ),
      },
              {
          path: "pages",
          element: (
            <SuspenseWrapper>
              <PagesPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "pages/landing-page",
          element: (
            <SuspenseWrapper>
              <LandingPagesPage />
            </SuspenseWrapper>
          ),
        },
     
        {
          path: "pages/view/:slug",
          element: (
            <SuspenseWrapper>
              <PageViewPage />
            </SuspenseWrapper>
          ),
        },
      
        {
          path: "pages/:pageSlug",
          element: (
            <SuspenseWrapper>
              <PageDetailsPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "metatags",
          element: (
            <SuspenseWrapper>
              <MetaTagsPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "metatags/add",
          element: (
            <SuspenseWrapper>
              <MetaTagEditPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "metatags/:metaTagId/edit",
          element: (
            <SuspenseWrapper>
              <MetaTagEditPage />
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
        path: "resource-center",
        element: (
          <SuspenseWrapper>
            <ResourceCenterPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "resource-center/add",
        element: (
          <SuspenseWrapper>
            <AddResourcePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "resource-center/:id",
        element: (
          <SuspenseWrapper>
            <ResourceDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "resource-center/edit/:id",
        element: (
          <SuspenseWrapper>
            <EditResourcePage />
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
  // Fallback route
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <a href="/admin/dashboard" className="text-blue-600 hover:underline">
            Go to Admin Panel
          </a>
        </div>
      </div>
    ),
  },
], {
  basename: "/admin"
});

export default AppRoutes;
