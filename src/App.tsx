import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/error-boundary";
import PageSkeleton from "@/components/ui/page-skeleton";
import { queryClient } from "@/lib/query-client";

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
const VectorManagement = lazy(() => import("./pages/VectorManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Enhanced loading fallback component with skeleton UI
const PageLoader = () => <PageSkeleton />;

const App = () => {
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
                        <Route path="/admin/vector-management" element={<VectorManagement />} />
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
