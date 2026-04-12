import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import HealthInsights from './pages/HealthInsights';
import ChatAssistant from './components/ChatAssistant';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar, ToastProvider, PageTransition } from './components/ui';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">Loading MediGuide...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
            {/* Background gradient orbs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
              <div className="absolute -top-[15%] -left-[10%] w-[45%] h-[45%] rounded-full bg-primary-400/6 dark:bg-primary-600/4 blur-[120px]" />
              <div className="absolute -bottom-[15%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/6 dark:bg-indigo-600/3 blur-[140px]" />
              <div className="absolute top-1/3 right-1/4 w-[25%] h-[25%] rounded-full bg-violet-400/4 dark:bg-violet-600/2 blur-[100px]" />
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
