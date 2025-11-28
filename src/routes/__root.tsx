import { createRootRoute, Outlet, useRouterState, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SidebarProvider } from '../contexts/SidebarContext';
import { ToastProvider, useToast } from '../contexts/ToastContext';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { ToastContainer } from '../components/Toast';
import { isTokenExpired, clearTokens, getTokens } from '../utils/tokenManager';

function RootLayout() {
  const { toasts, removeToast } = useToast();
  const routerState = useRouterState();
  const navigate = useNavigate();
  const isAuthPage = routerState.location.pathname.startsWith('/auth');
  
  // Check and clear expired tokens on app startup
  useEffect(() => {
    const { accessToken, refreshToken } = getTokens();
    
    if (accessToken && isTokenExpired(accessToken)) {
      console.log('Access token expired, clearing tokens');
      clearTokens();
      // Redirect to login
      if (!isAuthPage) {
        navigate({ to: '/auth/login' });
      }
    } else if (refreshToken && isTokenExpired(refreshToken)) {
      console.log('Refresh token expired, clearing tokens');
      clearTokens();
      // Redirect to login
      if (!isAuthPage) {
        navigate({ to: '/auth/login' });
      }
    }
  }, [isAuthPage, navigate]);
  
  // Check if user is logged in (after potential token cleanup)
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  const isLoggedIn = !!(token && user);
  
  // Redirect to login if trying to access protected routes without auth
  useEffect(() => {
    if (!isLoggedIn && !isAuthPage && routerState.location.pathname !== '/') {
      navigate({ to: '/auth/login' });
    }
  }, [isLoggedIn, isAuthPage, routerState.location.pathname, navigate]);
  
  // Show landing page layout for non-logged users on home page
  const isLandingPage = routerState.location.pathname === '/' && !isLoggedIn;

  return (
    <>
      {isAuthPage || isLandingPage ? (
        // Auth pages and landing page without sidebar/footer
        <>
          <Outlet />
          <ToastContainer toasts={toasts} onClose={removeToast} />
        </>
      ) : (
        // Regular app layout with sidebar/footer
        <div className="app-container">
          <Sidebar />

          <div className="main-content-wrapper">
            <main className="main-content">
              <Outlet />
            </main>

            <Footer />
          </div>

          {/* Toast Notifications */}
          <ToastContainer toasts={toasts} onClose={removeToast} />
        </div>
      )}
    </>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <ToastProvider>
          <RootLayout />
        </ToastProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
