import React, { useState } from 'react';
import { ShieldCheck, Sun, Moon, Laptop, Menu, X, User, LogOut, History, BookOpen, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Home' },
    { id: 'detect', label: 'Detect' },
    { id: 'history', label: 'History' },
    { id: 'awareness', label: 'Awareness' },
    { id: 'admin', label: 'Evaluation' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: Logo + Brand */}
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">PayShield</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-brand-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  AI Guard
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Pause. Verify. Pay Safely.
              </p>
            </div>
          </div>

          {/* CENTER: Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === item.id
                    ? 'bg-blue-50 dark:bg-navy-800 text-brand-700 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-navy-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  theme === 'light'
                    ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Light mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  theme === 'dark'
                    ? 'bg-white dark:bg-slate-700 text-blue-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Dark mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  theme === 'system'
                    ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="System preference"
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile / Account Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-semibold">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
                    {user.full_name || user.masked_mobile}
                  </span>
                </button>

                {profileOpen && (
                  <div 
                    onMouseLeave={() => setProfileOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-850 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 text-sm z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-slate-800 dark:text-white truncate">
                        {user.full_name || 'PayShield User'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user.masked_mobile}
                      </p>
                    </div>

                    <button
                      onClick={() => { onNavigate('profile'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-700 text-left"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </button>

                    <button
                      onClick={() => { onNavigate('history'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-700 text-left"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      Detection History
                    </button>

                    <button
                      onClick={() => { onNavigate('awareness'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-700 text-left"
                    >
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      Learning Insights
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === item.id
                    ? 'bg-blue-50 dark:bg-navy-800 text-brand-700 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
