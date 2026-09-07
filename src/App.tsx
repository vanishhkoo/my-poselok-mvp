
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ArticlesProvider } from "@/contexts/ArticlesContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ArticlePage from "./pages/ArticlePage";
import AuthorPage from "./pages/AuthorPage";
import ProfilePage from "./pages/ProfilePage";
import WriteArticlePage from "./pages/WriteArticlePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ArticlesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/journal/:id" element={<ArticlePage />} />
              <Route path="/authors/:id" element={<AuthorPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/write" element={<WriteArticlePage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ArticlesProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
