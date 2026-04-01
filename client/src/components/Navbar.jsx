import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartPulse, LogOut, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLanding = location.pathname === '/';

  return (
    <nav className={`fixed top-0 w-full h-16 z-50 flex items-center transition-all duration-300 ${
      isLanding && !user 
        ? 'bg-transparent' 
        : 'glass-panel shadow-sm'
    }`}>
      <div className="container mx-auto px-4 max-w-6xl flex justify-between items-center h-full">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-xl text-slate-800 dark:text-white tracking-tight">
          <div className="p-1.5 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-lg">
            <HeartPulse size={24} />
          </div>
          <span>Medi<span className="text-primary-600 dark:text-primary-400">Guide</span> AI</span>
        </Link>

        <div className="flex items-center gap-3 md:gap-5">
          <button 
            onClick={toggleTheme} 
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <>
              <motion.div whileHover={{ y: -1 }} className="hidden md:block">
                <Link to="/dashboard" className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors text-sm">
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors text-sm"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Logout</span>
              </motion.button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors text-sm md:text-base">
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/25 transition-all text-sm md:text-base">
                  Sign Up
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
