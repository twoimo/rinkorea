import { lazy, Suspense, useEffect, memo, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { StagewiseToolbar } from "@stagewise/toolbar-react";
import { ReactPlugin } from "@stagewise-plugins/react";
import { createPortal } from "react-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ErrorBoundary from "@/components/error-boundary";

// Optimized lazy loading with prefetch hints
const Index = lazy(() =>
  import("./pages/Index").then(module => ({ default: module.default }))
);
const About = lazy(() =>
  import("./pages/About").then(module => ({ default: module.default }))
);
const Products = lazy(() =>
  import("./pages/Products").then(module => ({ default: module.default }))
);
const Equipment = lazy(() =>
  import("./pages/Equipment").then(module => ({ default: module.default }))
);
const Projects = lazy(() =>
  import("./pages/Projects").then(module => ({ default: module.default }))
);
const Certificates = lazy(() =>
  import("./pages/Certificates").then(module => ({ default: module.default }))
);
const QnA = lazy(() =>
  import("./pages/QnA").then(module => ({ default: module.default }))
);
const News = lazy(() =>
  import("./pages/News").then(module => ({ default: module.default }))
);
const Resources = lazy(() =>
  import("./pages/Resources").then(module => ({ default: module.default }))
);
const Contact = lazy(() =>
  import("./pages/Contact").then(module => ({ default: module.default }))
);
const Auth = lazy(() =>
  import("./pages/Auth").then(module => ({ default: module.default }))
);
const Shop = lazy(() =>
  import("./pages/Shop").then(module => ({ default: module.default }))
);
const Profile = lazy(() =>
  import("./pages/Profile").then(module => ({ default: module.default }))
);
const AdminDangerZone = lazy(() =>
  import("./pages/AdminDangerZone").then(module => ({ default: module.default }))
);
const RevenueManagement = lazy(() =>
  import("./pages/RevenueManagement").then(module => ({ default: module.default }))
);
const NotFound = lazy(() =>
  import("./pages/NotFound").then(module => ({ default: module.default }))
);

// Optimized QueryClient with better caching strategy
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error &&
          typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      networkMode: 'offlineFirst', // Optimize for mobile networks
    },
    mutations: {
      retry: false,
      networkMode: 'offlineFirst',
    }
  },
});

// Memoized Toolbar Portal for development
const ToolbarPortal = memo(() => {
  if (typeof window === 'undefined') return null;
  const isDev = import.meta.env.DEV;
  if (!isDev) return null;

  return createPortal(
    <div className="stagewise-toolbar-wrapper fixed top-0 right-0 z-[9999]">
      <StagewiseToolbar
        config={{
          plugins: [ReactPlugin]
        }}
      />
    </div>,
    document.body
  );
});
ToolbarPortal.displayName = 'ToolbarPortal';

// Optimized loading fallback component with fade-in
const PageLoader = memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-background fade-in">
    <LoadingSpinner className="w-8 h-8" />
  </div>
));
PageLoader.displayName = 'PageLoader';

// Optimized mobile optimization hook with cleanup
const useMobileOptimization = () => {
  useEffect(() => {
    let touchTimeout: NodeJS.Timeout;

    // Prevent double-tap zoom on mobile with debouncing
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }

      clearTimeout(touchTimeout);
      touchTimeout = setTimeout(() => {
        // Additional touch optimizations can go here
      }, 300);
    };

    // Optimize scroll performance
    const optimizeScrolling = () => {
      document.body.style.setProperty('-webkit-overflow-scrolling', 'touch');
      document.body.style.setProperty('overscroll-behavior', 'contain');
    };

    // Apply optimizations
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    optimizeScrolling();

    return () => {
      clearTimeout(touchTimeout);
      document.removeEventListener('touchstart', handleTouchStart);
      document.body.style.removeProperty('-webkit-overflow-scrolling');
      document.body.style.removeProperty('overscroll-behavior');
    };
  }, []);
};

// Memoized App Routes component
const AppRoutes = memo(() => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/about" element={<About />} />
    <Route path="/products" element={<Products />} />
    <Route path="/equipment" element={<Equipment />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/certificates" element={<Certificates />} />
    <Route path="/qna" element={<QnA />} />
    <Route path="/news" element={<News />} />
    <Route path="/resources" element={<Resources />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/shop" element={<Shop />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/admin/danger" element={<AdminDangerZone />} />
    <Route path="/revenue-management" element={<RevenueManagement />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
));
AppRoutes.displayName = 'AppRoutes';

// Main App component with full optimization
const App = memo(() => {
  useMobileOptimization();

  // Memoize QueryClient to prevent recreation on every render
  const queryClient = useMemo(createQueryClient, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ToolbarPortal />
          <div className="app-content">
            <Toaster />
            <Sonner />
            <AuthProvider>
              <LanguageProvider>
                <BrowserRouter>
                  <div className="min-h-screen flex flex-col bg-background contain-layout">
                    <Suspense fallback={<PageLoader />}>
                      <AppRoutes />
                    </Suspense>
                  </div>
                </BrowserRouter>
              </LanguageProvider>
            </AuthProvider>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
});

App.displayName = 'App';

export default App;
