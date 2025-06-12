import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StagewiseToolbar } from "@stagewise/toolbar-react";
import { ReactPlugin } from "@stagewise-plugins/react";
import { createPortal } from "react-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Products from "./pages/Products";
import Equipment from "./pages/Equipment";
import Projects from "./pages/Projects";
import Certificates from "./pages/Certificates";
import QnA from "./pages/QnA";
import News from "./pages/News";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Shop from "./pages/Shop";
import Profile from "./pages/Profile";
import AdminDangerZone from "./pages/AdminDangerZone";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ToolbarPortal = () => {
  if (typeof window === 'undefined') return null;

  // 개발 모드에서만 툴바를 표시
  const isDev = import.meta.env.DEV;
  if (!isDev) return null;

  // 디버그 정보 출력
  console.log('Stagewise Toolbar Debug:', {
    isDev,
    window: typeof window,
    plugins: [ReactPlugin]
  });

  return createPortal(
    <div className="stagewise-toolbar-wrapper" style={{ position: 'fixed', top: 0, right: 0, zIndex: 9999 }}>
      <StagewiseToolbar
        config={{
          plugins: [ReactPlugin]
        }}
      />
    </div>,
    document.body
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToolbarPortal />
      <div className="app-content">
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
