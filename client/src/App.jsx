import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatAssistant from './components/ChatAssistant';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Landing Page is the root for non-authenticated users */}
          <Route path="/" element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <div className="container mx-auto px-4 max-w-6xl flex-1 flex flex-col pt-20">
                <Login />
              </div>
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <div className="container mx-auto px-4 max-w-6xl flex-1 flex flex-col pt-20">
                <Register />
              </div>
            </PublicRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <div className="container mx-auto px-4 max-w-6xl flex-1 flex flex-col pt-20 pb-10">
                <Dashboard />
              </div>
              <ChatAssistant />
            </PrivateRoute>
          } />
          {/* Catch all → redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
            {/* Background gradient blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
              <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-400/8 dark:bg-primary-600/8 blur-[100px]" />
              <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/8 dark:bg-indigo-600/6 blur-[120px]" />
            </div>
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
