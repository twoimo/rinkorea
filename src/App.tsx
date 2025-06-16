import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StagewiseToolbar } from "@stagewise/toolbar-react";
import { ReactPlugin } from "@stagewise-plugins/react";
import { createPortal } from "react-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ErrorBoundary from "@/components/error-boundary";

// Lazy load pages with prefetch
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Products = lazy(() => import("./pages/Products"));
const Equipment = lazy(() => import("./pages/Equipment"));
const Projects = lazy(() => import("./pages/Projects"));
const Certificates = lazy(() => import("./pages/Certificates"));
const QnA = lazy(() => import("./pages/QnA"));
const News = lazy(() => import("./pages/News"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const Shop = lazy(() => import("./pages/Shop"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDangerZone = lazy(() => import("./pages/AdminDangerZone"));
const RevenueManagement = lazy(() => import("./pages/RevenueManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Configure QueryClient with optimized settings for mobile
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst', // Optimize for mobile networks
    },
  },
});

const ToolbarPortal = () => {
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
};

// Optimized loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <LoadingSpinner className="w-8 h-8" />
  </div>
);

// Mobile optimization hook
const useMobileOptimization = () => {
  useEffect(() => {
    // Prevent double-tap zoom on mobile
    document.addEventListener('touchstart', (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, { passive: false });

    // Optimize scroll performance
    document.body.style.setProperty('-webkit-overflow-scrolling', 'touch');

    return () => {
      document.body.style.removeProperty('-webkit-overflow-scrolling');
    };
  }, []);
};

const App = () => {
  useMobileOptimization();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ToolbarPortal />
          <div className="app-content">
            <Toaster />
            <Sonner />
            <AuthProvider>
              <BrowserRouter>
                <div className="min-h-screen flex flex-col bg-background">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/equipment" element={<Equipment />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/certificates" element={<Certificates />} />
                      <Route path="/qna" element={<QnA />} />
                      <Route path="/news" element={<News />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/admin/danger" element={<AdminDangerZone />} />
                      <Route path="/revenue-management" element={<RevenueManagement />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </div>
              </BrowserRouter>
            </AuthProvider>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
