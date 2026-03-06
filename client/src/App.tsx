import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/lib/protected-route";
import { Loader2 } from "lucide-react";

const Home = lazy(() => import("@/pages/home"));
const CoursesPage = lazy(() => import("@/pages/courses"));
const MockTestsPage = lazy(() => import("@/pages/mock-tests"));
const ClassesPage = lazy(() => import("@/pages/classes"));
const ResourcesPage = lazy(() => import("@/pages/resources"));
const NoticesPage = lazy(() => import("@/pages/notices"));
const ContactPage = lazy(() => import("@/pages/contact"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const AdminDashboard = lazy(() => import("@/pages/admin"));
const CourseDetailPage = lazy(() => import("@/pages/course-detail"));
const MockExamPage = lazy(() => import("@/pages/mock-exam"));
const MockReviewPage = lazy(() => import("@/pages/mock-review"));
const NotFound = lazy(() => import("@/pages/not-found"));

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/courses" component={CoursesPage} />
        <Route path="/courses/:id" component={CourseDetailPage} />
        <Route path="/mock-tests" component={MockTestsPage} />
        <Route path="/mock-tests/:id" component={MockExamPage} />
        <ProtectedRoute path="/mock-review/:submissionId" component={MockReviewPage} />
        <Route path="/classes" component={ClassesPage} />
        <Route path="/resources" component={ResourcesPage} />
        <Route path="/notices" component={NoticesPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/mentor" component={Dashboard} />
        <ProtectedRoute path="/moderator" component={Dashboard} />
        <ProtectedRoute path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
