import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/error-boundary";
import PageSkeleton from "@/components/ui/page-skeleton";
import { ChatbotWidget } from './components/chatbot/ChatbotWidget';
import { useProfile } from "./hooks/useProfile";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst',
    },
  },
});

const PageLoader = () => <PageSkeleton />;

const AppContent = () => {
  const { user } = useAuth();
  const { profile } = useProfile();

  return (
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
      <ChatbotWidget user={user} profile={profile} />
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LanguageProvider>
            <AuthProvider>
              <TooltipProvider>
                <div className="app-content">
                  <Toaster />
                  <Sonner />
                  <AppContent />
                </div>
              </TooltipProvider>
            </AuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
