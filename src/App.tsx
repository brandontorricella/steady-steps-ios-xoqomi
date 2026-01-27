import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AuthProvider } from "@/hooks/useAuth";
import { useDeepLinks } from "@/hooks/useDeepLinks";
import Index from "./pages/Index";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import { BadgesPage } from "./pages/BadgesPage";
import { ProgressPage } from "./pages/ProgressPage";
import { SettingsPage } from "./pages/SettingsPage";
import { CoachPage } from "./pages/CoachPage";
import { AuthPage } from "./pages/AuthPage";
import { HabitLibraryPage } from "./pages/HabitLibraryPage";
import { WeeklySummaryPage } from "./pages/WeeklySummaryPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { LegalPage } from "./pages/LegalPage";
import { HelpPage } from "./pages/HelpPage";
import { CommunityPage } from "./pages/CommunityPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle deep links within the router context
const DeepLinkHandler = ({ children }: { children: React.ReactNode }) => {
  useDeepLinks();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DeepLinkHandler>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile-setup" element={<ProfileSetupPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/badges" element={<BadgesPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/coach" element={<CoachPage />} />
                <Route path="/habit-library" element={<HabitLibraryPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/weekly-summary" element={<WeeklySummaryPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/help" element={<HelpPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DeepLinkHandler>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
