import { RouterProvider } from 'react-router-dom';
import { RegistrationProvider } from '@/contexts/RegistrationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/toast';
import { OfflineBanner } from '@/components/ui/states';
import { router } from './router';
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-4"
          >
            Skip to content
          </a>
          <OfflineBanner />
          <RegistrationProvider>
            <RouterProvider router={router} />
          </RegistrationProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
