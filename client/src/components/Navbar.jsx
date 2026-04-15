import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartPulse, LogOut, Moon, Sun, Menu, Bell, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLanding = location.pathname === '/';
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const showFullNav = !isLanding && !isAuthPage && user;

  return (
    <>
      <nav
        id="main-navbar"
        className={`fixed top-0 right-0 z-50 h-16 flex items-center transition-all duration-500 ease-in-out ${
          showFullNav ? 'left-0 lg:left-[240px]' : 'left-0'
        } ${
          scrolled || !isLanding
            ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-slate-200/40 dark:border-slate-800/40 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className={`w-full px-6 lg:px-10 ${showFullNav ? '' : 'container mx-auto max-w-7xl'} flex justify-between items-center h-full`}>
          {/* Left side: Logo or hamburger */}
          <div className="flex items-center gap-3">
            {showFullNav && (
              <button
                onClick={onMobileMenuToggle}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                aria-label="Toggle menu"
              >
                <Menu size={20} />
              </button>
            )}

            {(!showFullNav || !user) && (
              <Link
                to={user ? '/dashboard' : '/'}
                className="flex items-center gap-2.5 font-black text-xl text-slate-800 dark:text-white tracking-tight"
              >
                <div className="p-1.5 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl shadow-md shadow-primary-500/25">
                  <HeartPulse size={22} />
                </div>
                <span>
                  Medi<span className="text-primary-600 dark:text-primary-400">Guide</span>
                  <span className="text-[10px] ml-1 font-bold text-slate-400 dark:text-slate-500 tracking-widest">AI</span>
                </span>
              </Link>
            )}

            {showFullNav && (
              <div className="hidden md:block">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  {location.pathname === '/dashboard' && 'Dashboard'}
                  {location.pathname === '/health-insights' && 'AI Insights'}
                  {location.pathname === '/profile' && 'Profile'}
                </h2>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-amber-400 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
              id="theme-toggle"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {user ? (
              <>
                {/* Notification bell */}
                <button
                  className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 relative group"
                  aria-label="Notifications"
                  id="notification-bell"
                >
                  <Bell size={18} className="group-hover:rotate-12 transition-transform" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                </button>

                {/* Mobile nav items for non-sidebar pages */}
                {!showFullNav && (
                  <div className="md:hidden">
                    <button
                      onClick={() => setMobileOpen(!mobileOpen)}
                      className="p-2 text-slate-600 dark:text-slate-300 rounded-lg"
                    >
                      {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors text-sm rounded-xl"
                >
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/25 transition-all text-sm"
                  >
                    Get Started
                  </Link>
                </motion.div>
                <div className="sm:hidden">
                  <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-slate-600 dark:text-slate-300 rounded-lg"
                  >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu (only for landing/auth pages) */}
      <AnimatePresence>
        {mobileOpen && !showFullNav && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-xl md:hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold">📊 Dashboard</Link>
                  <Link to="/health-insights" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold">🧠 AI Insights</Link>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold">👤 Profile</Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-danger-50 dark:hover:bg-danger-900/30 text-danger-600 dark:text-danger-400 text-sm font-semibold">🚪 Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold text-center">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
