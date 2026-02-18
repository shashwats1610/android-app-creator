import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/stores/useAppStore";
import { AppLayout } from "@/components/layout/AppLayout";
import OnboardingPage from "@/pages/OnboardingPage";
import HomePage from "@/pages/HomePage";
import WorkoutPage from "@/pages/WorkoutPage";
import WorkoutDayPage from "@/pages/WorkoutDayPage";
import HistoryPage from "@/pages/HistoryPage";
import RecordsPage from "@/pages/RecordsPage";
import SettingsPage from "@/pages/SettingsPage";
import NutritionPage from "@/pages/NutritionPage";
import EditPlanPage from "@/pages/EditPlanPage";
import EditDayPage from "@/pages/EditDayPage";
import SessionPage from "@/pages/SessionPage";
import SessionCompletePage from "@/pages/SessionCompletePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  useTheme(); // Apply theme on mount
  const onboardingComplete = useAppStore((s) => s.settings.onboardingComplete);

  if (!onboardingComplete) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/workout/day/:dayId" element={<WorkoutDayPage />} />
        <Route path="/workout/edit" element={<EditPlanPage />} />
        <Route path="/workout/edit/day/:dayId" element={<EditDayPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
      </Route>
      <Route path="/session" element={<SessionPage />} />
      <Route path="/session/complete" element={<SessionCompletePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
