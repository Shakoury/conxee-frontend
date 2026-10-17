import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
  useRouteError,
} from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton, ErrorState } from '@/components/ui/states';
import ResponsiveLayout from '@/layouts/ResponsiveLayout';
import PublicLayout from '@/layouts/PublicLayout';
import AdminLayout from '@/layouts/AdminLayout';
function Guard({
  admin = false,
  guest = false,
}: {
  admin?: boolean;
  guest?: boolean;
}) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading)
    return (
      <div className="p-8">
        <Skeleton className="mx-auto h-16 max-w-sm" />
      </div>
    );
  if (guest)
    return isAuthenticated && location.state?.reason !== 'admin-required' ? (
      <Navigate to="/" replace />
    ) : (
      <Outlet />
    );
  return isAuthenticated && (!admin || isAdmin) ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      state={{
        from: location.pathname,
        ...(admin ? { reason: 'admin-required' } : {}),
      }}
      replace
    />
  );
}
function RouteError() {
  useRouteError();
  return (
    <ErrorState
      message="This page could not be loaded."
      onRetry={() => window.location.reload()}
    />
  );
}
export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            element: <Guard guest />,
            children: [
              {
                path: '/login',
                lazy: async () => ({
                  Component: (await import('./pages/Login')).default,
                }),
              },
              {
                path: '/register',
                lazy: async () => ({
                  Component: (await import('./pages/Register')).default,
                }),
              },
            ],
          },
          {
            path: '/auth',
            lazy: async () => ({
              Component: (await import('./pages/Login')).default,
            }),
          },
          {
            path: '/verify-email',
            lazy: async () => ({
              Component: (await import('./pages/RegisterVerify')).default,
            }),
          },
          {
            path: '/register/institution',
            lazy: async () => ({
              Component: (await import('./pages/RegisterInstitution')).default,
            }),
          },
          {
            path: '/register/faculty',
            lazy: async () => ({
              Component: (await import('./pages/RegisterFaculty')).default,
            }),
          },
          {
            path: '/register/details',
            lazy: async () => ({
              Component: (await import('./pages/RegisterDetails')).default,
            }),
          },
          {
            path: '/register/verify',
            lazy: async () => ({
              Component: (await import('./pages/RegisterVerify')).default,
            }),
          },
          {
            path: '/register/student-id',
            lazy: async () => ({
              Component: (await import('./pages/RegisterStudentId')).default,
            }),
          },
          {
            path: '/reset-password',
            lazy: async () => ({
              Component: (await import('./pages/ResetPassword')).default,
            }),
          },
          {
            path: '/forgot-password',
            lazy: async () => ({
              Component: (await import('./pages/ForgotPassword')).default,
            }),
          },
          {
            path: '/landing',
            lazy: async () => ({
              Component: (await import('./pages/Landing')).default,
            }),
          },
          {
            path: '/about',
            lazy: async () => ({
              Component: (await import('./pages/About')).default,
            }),
          },
          {
            path: '/help',
            lazy: async () => ({
              Component: (await import('./pages/Help')).default,
            }),
          },
          {
            path: '/privacy',
            lazy: async () => ({
              Component: (await import('./pages/Privacy')).default,
            }),
          },
          {
            path: '/terms',
            lazy: async () => ({
              Component: (await import('./pages/Terms')).default,
            }),
          },
          {
            path: '/404',
            lazy: async () => ({
              Component: (await import('./pages/NotFound')).default,
            }),
          },
          {
            path: '/error',
            lazy: async () => ({
              Component: (await import('./pages/GeneralError')).default,
            }),
          },
        ],
      },
      {
        element: <Guard />,
        children: [
          {
            element: <ResponsiveLayout />,
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('./pages/Feed')).default,
                }),
              },
              {
                path: '/explore',
                lazy: async () => ({
                  Component: (await import('./pages/SearchAndDiscovery'))
                    .default,
                }),
              },
              {
                path: '/notifications',
                lazy: async () => ({
                  Component: (await import('./pages/Notifications')).default,
                }),
              },
              {
                path: '/profile',
                lazy: async () => ({
                  Component: (await import('./pages/OwnProfile')).default,
                }),
              },
              {
                path: '/profile/:username',
                lazy: async () => ({
                  Component: (await import('./pages/UserProfile')).default,
                }),
              },
              {
                path: '/communities',
                lazy: async () => ({
                  Component: (await import('./pages/CommunityDiscovery'))
                    .default,
                }),
              },
              {
                path: '/communities/:id',
                lazy: async () => ({
                  Component: (await import('./pages/CommunityDetail')).default,
                }),
              },
              {
                path: '/communities/:id/files',
                lazy: async () => ({
                  Component: (await import('./pages/CommunityFiles')).default,
                }),
              },
              {
                path: '/communities/:id/announcements',
                lazy: async () => ({
                  Component: (await import('./pages/CommunityAnnouncements'))
                    .default,
                }),
              },
              {
                path: '/watch',
                lazy: async () => ({
                  Component: (await import('./pages/WatchHome')).default,
                }),
              },
              {
                path: '/watch/reels',
                lazy: async () => ({
                  Component: (await import('./pages/Reels')).default,
                }),
              },
              {
                path: '/watch/playlists',
                lazy: async () => ({
                  Component: (await import('./pages/Playlists')).default,
                }),
              },
              {
                path: '/marketplace',
                lazy: async () => ({
                  Component: (await import('./pages/MarketplaceHome')).default,
                }),
              },
              {
                path: '/marketplace/:id',
                lazy: async () => ({
                  Component: (await import('./pages/ProductDetail')).default,
                }),
              },
              {
                path: '/marketplace/shop/:id',
                lazy: async () => ({
                  Component: (await import('./pages/Storefront')).default,
                }),
              },
              {
                path: '/marketplace/create',
                lazy: async () => ({
                  Component: (await import('./pages/CreateListing')).default,
                }),
              },
              {
                path: '/events',
                lazy: async () => ({
                  Component: (await import('./pages/EventsHome')).default,
                }),
              },
              {
                path: '/events/:id',
                lazy: async () => ({
                  Component: (await import('./pages/EventDetail')).default,
                }),
              },
              {
                path: '/events/create',
                lazy: async () => ({
                  Component: (await import('./pages/CreateEvent')).default,
                }),
              },
              {
                path: '/tutorials',
                lazy: async () => ({
                  Component: (await import('./pages/TutorialsHome')).default,
                }),
              },
              {
                path: '/tutorials/:id',
                lazy: async () => ({
                  Component: (await import('./pages/TutorialDetail')).default,
                }),
              },
              {
                path: '/resources',
                lazy: async () => ({
                  Component: (await import('./pages/AcademicResources'))
                    .default,
                }),
              },
              {
                path: '/messages',
                lazy: async () => ({
                  Component: (await import('./pages/MessagingInbox')).default,
                }),
              },
              {
                path: '/messages/:id',
                lazy: async () => ({
                  Component: (await import('./pages/Conversation')).default,
                }),
              },
              {
                path: '/settings',
                lazy: async () => ({
                  Component: (await import('./pages/SettingsHome')).default,
                }),
              },
              {
                path: '/settings/profile',
                lazy: async () => ({
                  Component: (await import('./pages/ProfileSettings')).default,
                }),
              },
              {
                path: '/settings/privacy',
                lazy: async () => ({
                  Component: (await import('./pages/PrivacySettings')).default,
                }),
              },
              {
                path: '/settings/notifications',
                lazy: async () => ({
                  Component: (await import('./pages/NotificationSettings'))
                    .default,
                }),
              },
              {
                path: '/settings/appearance',
                lazy: async () => ({
                  Component: (await import('./pages/AppearanceSettings'))
                    .default,
                }),
              },
              {
                path: '/settings/help',
                lazy: async () => ({
                  Component: (await import('./pages/HelpAndSupport')).default,
                }),
              },
            ],
          },
        ],
      },
      {
        element: <Guard admin />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: '/admin',
                lazy: async () => ({
                  Component: (await import('./pages/AdminDashboard')).default,
                }),
              },
              {
                path: '/admin/users',
                lazy: async () => ({
                  Component: (await import('./pages/UserManagement')).default,
                }),
              },
              {
                path: '/admin/verification',
                lazy: async () => ({
                  Component: (await import('./pages/StudentVerificationQueue'))
                    .default,
                }),
              },
              {
                path: '/admin/communities',
                lazy: async () => ({
                  Component: (await import('./pages/CommunityManagement'))
                    .default,
                }),
              },
              {
                path: '/admin/reports',
                lazy: async () => ({
                  Component: (await import('./pages/ReportsAndModeration'))
                    .default,
                }),
              },
              {
                path: '/admin/institutions',
                lazy: async () => ({
                  Component: (await import('./pages/InstitutionCatalogue'))
                    .default,
                }),
              },
              {
                path: '/admin/announcements',
                lazy: async () => ({
                  Component: (await import('./pages/Announcements')).default,
                }),
              },
              {
                path: '/admin/system',
                lazy: async () => ({
                  Component: (await import('./pages/SystemStatus')).default,
                }),
              },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]);
