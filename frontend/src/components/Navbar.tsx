import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore, getUserDisplayName } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { LogOut, User, Sun, Moon, Shield, Sparkles, ChevronDown, CheckCircle2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const displayName = getUserDisplayName(user);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const getRoleBadgeClasses = (role?: string) => {
    if (role === 'teacher') {
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between px-6 transition-colors">
      <div className="flex items-center space-x-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
          <Sparkles size={13} className="text-indigo-500 animate-pulse" />
          <span>AI Teaching Assistant</span>
        </span>
      </div>

      <div className="flex items-center space-x-3">
        {/* Dark/Light Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-all duration-200 shadow-xs"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
            <Sun size={18} className="text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon size={18} className="text-slate-600 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-all duration-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-xs uppercase">
              {displayName.charAt(0)}
            </div>
            <div className="text-left hidden sm:block max-w-[140px] md:max-w-[200px]">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium capitalize flex items-center gap-1">
                <span>{user?.role || 'Member'}</span>
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''}`}
            />
          </button>

          {/* Profile Dropdown Popup */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              {/* User Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-base shadow-sm uppercase">
                    {displayName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-400 font-medium truncate" title={user?.email}>
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Role & Account Info Badges */}
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeClasses(
                      user?.role
                    )}`}
                  >
                    <Shield size={11} className="mr-1" />
                    <span className="capitalize">{user?.role || 'Student'}</span>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={10} className="mr-1" />
                    Active
                  </span>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 flex items-center space-x-2.5 transition-colors"
                >
                  <Settings size={16} className="text-slate-400 dark:text-slate-500" />
                  <span className="font-medium">Account Settings</span>
                </button>
              </div>

              {/* Logout Button */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center space-x-2.5 transition-colors font-medium"
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
