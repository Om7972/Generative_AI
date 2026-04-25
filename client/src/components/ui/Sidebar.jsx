import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Brain, User, HeartPulse, ChevronLeft, ChevronRight,
  LogOut, Activity, X, Target, ScanFace
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/health-insights', icon: Brain, label: 'AI Insights' },
  { path: '/scanner', icon: ScanFace, label: 'Report Scanner' },
  { path: '/simulation', icon: Activity, label: 'Digital Twin' },
  { path: '/coach', icon: Target, label: 'AI Coach' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = (isActive) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative overflow-hidden ${
      isActive
        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm border border-primary-200/50 dark:border-primary-800/50'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 py-5 border-b border-slate-200/50 dark:border-slate-800/50`}>
        {!collapsed && (
          <Link to="/">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="p-1.5 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl shadow-md shadow-primary-500/20"
              >
                <HeartPulse size={20} />
              </motion.div>
              <span className="font-black text-lg text-slate-800 dark:text-white tracking-tight">
                Medi<span className="text-primary-600 dark:text-primary-400">Guide</span>
              </span>
            </motion.div>
          </Link>
        )}
        {collapsed && (
          <Link to="/">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="p-1.5 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl shadow-md shadow-primary-500/20 cursor-pointer"
            >
              <HeartPulse size={20} />
            </motion.div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed?.(!collapsed)}
          className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft size={16} />
          </motion.div>
        </button>
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen?.(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation with staggered items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
          >
            <NavLink
              to={item.path}
              onClick={() => setMobileOpen?.(false)}
              className={({ isActive }) => linkClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator line */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                  </motion.div>
                  {!collapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-2">
        {!collapsed && user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-3 py-2 mb-2"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-sm"
            >
              {(user.username || 'U')[0].toUpperCase()}
            </motion.div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.username}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Patient</p>
            </div>
          </motion.div>
        )}
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen?.(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen w-[260px] z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
