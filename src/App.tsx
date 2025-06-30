import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ErrorBoundary from "@/components/error-boundary";
import LoadingFallback from "@/components/LoadingFallback";

// Lazy load pages with prefetch
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Products = lazy(() => import("./pages/Products"));
const Equipment = lazy(() => import("./pages/Equipment"));
const Projects = lazy(() => import("./pages/Projects"));
const Certificates = lazy(() => import("./pages/Certificates"));
const QnA = lazy(() => import("./pages/QnA"));
const News = lazy(() => import("./pages/News"));
const Resources = lazy(() => import("./pages/Resources"));
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

// Simplified loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="text-center">
      <LoadingSpinner className="w-8 h-8 mx-auto" />
      <p className="mt-2 text-gray-600">로딩 중...</p>
    </div>
  </div>
);

// Simplified mobile optimization (no performance interference)
const useMobileOptimization = () => {
  useEffect(() => {
    // Minimal mobile optimizations only
    console.log('Mobile optimizations initialized');
  }, []);
};

const App = () => {
  useMobileOptimization();

  return (
    <ErrorBoundary>
      {/* LoadingFallback temporarily disabled for debugging NO_FCP */}
      {/* <LoadingFallback /> */}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="app-content">
            <Toaster />
            <Sonner />
            <AuthProvider>
              <LanguageProvider>
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
                        <Route path="/resources" element={<Resources />} />
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
              </LanguageProvider>
            </AuthProvider>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
