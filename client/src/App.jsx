import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import HealthInsights from './pages/HealthInsights';
import HealthSimulationLab from './pages/HealthSimulationLab';
import AICoach from './pages/AICoach';
import ReportScanner from './pages/ReportScanner';
import ChatAssistant from './components/ChatAssistant';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar, ToastProvider, PageTransition, VoiceAssistant } from './components/ui';

/* ── Creative Loader Component ── */
function AppLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-6">
        {/* DNA-inspired animated loader */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-800/40 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
          <div className="absolute inset-2 border-4 border-violet-400/50 rounded-full border-b-transparent animate-spin-slow" style={{ animationDirection: 'reverse' }} />
          <div className="absolute inset-4 border-4 border-cyan-400/30 rounded-full border-l-transparent animate-spin" style={{ animationDuration: '2s' }} />
        </div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse tracking-wide">
          Loading MediGuide...
        </p>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AppLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

/* ── Cursor Glow Effect Hook ── */
function useCursorGlow() {
  useEffect(() => {
    const body = document.body;
    body.classList.add('cursor-glow');

    const handleMouseMove = (e) => {
      body.style.setProperty('--cursor-x', `${e.clientX}px`);
      body.style.setProperty('--cursor-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      body.classList.remove('cursor-glow');
    };
  }, []);
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Enable cursor glow effect across the app
  useCursorGlow();

  const isLanding = location.pathname === '/';
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const showSidebar = user && !isLanding && !isAuthPage;

  return (
    <>
      {/* Sidebar — only for authenticated dashboard pages */}
      {showSidebar && (
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />
      )}

      {/* Navbar */}
      <Navbar onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      {/* Main content area */}
      <main
        className="flex-1 flex flex-col transition-all duration-300"
      >
        {/* Sidebar margin applied via inline style for dynamic width */}
        <div
          className="flex-1 flex flex-col"
          style={showSidebar ? { marginLeft: sidebarCollapsed ? '72px' : '240px' } : {}}
        >
          <PageTransition>
            <Routes location={location}>
              {/* Landing page */}
              <Route path="/" element={<Landing />} />

              {/* Auth pages */}
              <Route path="/login" element={
                <GuestOnly>
                  <div className="container mx-auto px-4 max-w-6xl flex-1 flex flex-col pt-20">
                    <Login />
                  </div>
                </GuestOnly>
              } />
              <Route path="/register" element={
                <GuestOnly>
                  <div className="container mx-auto px-4 max-w-6xl flex-1 flex flex-col pt-20">
                    <Register />
                  </div>
                </GuestOnly>
              } />

              {/* Protected dashboard pages */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <div className="px-4 lg:px-8 flex-1 flex flex-col pt-20 pb-10 max-w-[1400px]">
                    <Dashboard />
                  </div>
                  <ChatAssistant />
                  <VoiceAssistant />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <div className="px-4 lg:px-8 flex-1 flex flex-col pt-20 pb-10 max-w-[1400px]">
                    <Profile />
                  </div>
                </PrivateRoute>
              } />
              <Route path="/health-insights" element={
                <PrivateRoute>
                  <div className="px-4 lg:px-8 flex-1 flex flex-col pt-20 pb-10 max-w-[1400px]">
                    <HealthInsights />
                  </div>
                  <ChatAssistant />
                  <VoiceAssistant />
                </PrivateRoute>
              } />
              <Route path="/simulation" element={
                <PrivateRoute>
                  <div className="px-4 lg:px-8 flex-1 flex flex-col pt-20 pb-10 max-w-[1400px]">
                    <HealthSimulationLab />
                  </div>
                  <ChatAssistant />
                  <VoiceAssistant />
                </PrivateRoute>
              } />
              <Route path="/coach" element={
                <PrivateRoute>
                  <div className="px-4 lg:px-8 flex-1 flex flex-col pt-20 pb-10 max-w-[1400px]">
                    <AICoach />
                  </div>
                  <ChatAssistant />
                  <VoiceAssistant />
                </PrivateRoute>
              } />
              <Route path="/scanner" element={
                <PrivateRoute>
                  <div className="px-4 lg:px-8 flex-1 flex flex-col pt-20 pb-10 max-w-[1400px]">
                    <ReportScanner />
                  </div>
                  <ChatAssistant />
                  <VoiceAssistant />
                </PrivateRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PageTransition>
        </div>
      </main>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
            {/* Animated background gradient orbs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
              <div className="absolute -top-[15%] -left-[10%] w-[45%] h-[45%] rounded-full bg-primary-400/6 dark:bg-primary-600/4 blur-[120px] animate-float" />
              <div className="absolute -bottom-[15%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/6 dark:bg-indigo-600/3 blur-[140px] animate-float" style={{ animationDelay: '-3s' }} />
              <div className="absolute top-1/3 right-1/4 w-[25%] h-[25%] rounded-full bg-violet-400/4 dark:bg-violet-600/2 blur-[100px] animate-float" style={{ animationDelay: '-5s' }} />
            </div>

            <AppRoutes />
            <ToastProvider />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
