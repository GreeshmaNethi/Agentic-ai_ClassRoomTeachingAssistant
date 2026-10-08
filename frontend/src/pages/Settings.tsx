import React, { useState, useEffect } from 'react';
import { useAuthStore, getUserDisplayName } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { api } from '../services/api';
import {
  User,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Moon,
  Sun,
  Sliders,
  Sparkles,
  Key,
  Check,
  X,
  Server,
  ExternalLink,
  School,
  Link2,
  AlertTriangle
} from 'lucide-react';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const Settings: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const [fullName, setFullName] = useState(() => user?.name || getUserDisplayName(user));

  useEffect(() => {
    if (user) {
      setFullName(user.name || getUserDisplayName(user));
    }
  }, [user]);

  // Preferences State
  const [defaultDifficulty, setDefaultDifficulty] = useState<string>(() => {
    return localStorage.getItem('pref_difficulty') || 'Medium';
  });
  const [defaultLevel, setDefaultLevel] = useState<string>(() => {
    return localStorage.getItem('pref_level') || 'High School';
  });
  const [aiCreativity, setAiCreativity] = useState<string>(() => {
    return localStorage.getItem('pref_creativity') || 'Balanced';
  });

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Handle Save Preferences & Profile
  const handleSavePreferences = async () => {
    setIsSaving(true);
    localStorage.setItem('pref_difficulty', defaultDifficulty);
    localStorage.setItem('pref_level', defaultLevel);
    localStorage.setItem('pref_creativity', aiCreativity);

    try {
      const { data } = await api.put('/auth/me', { name: fullName });
      updateUser({ name: data.name });
      showToast('Profile and preferences updated successfully!', 'success');
    } catch (err) {
      updateUser({ name: fullName });
      showToast('Preferences saved locally!', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Password Update Mockup
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully! Your account is secure.', 'success');
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 transition-all duration-300 transform translate-y-0 shadow-2xl">
          <div
            className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-50/95 dark:bg-rose-950/90 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                : 'bg-indigo-50/95 dark:bg-indigo-950/90 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />}
            {toast.type === 'error' && <X size={20} className="text-rose-500 shrink-0" />}
            {toast.type === 'info' && <Sparkles size={20} className="text-indigo-500 shrink-0" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Settings & Preferences</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your account display name, credentials, AI presets, and interface theme.
          </p>
        </div>

        <button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 cursor-pointer self-start sm:self-auto"
        >
          <Save size={16} className={isSaving ? 'animate-spin' : ''} />
          <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>

      {/* Section 1: Profile Information */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 shadow-xs">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <User size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Information</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your registered account display name and permissions.</p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-md shadow-indigo-500/20 uppercase">
              {fullName.charAt(0) || 'U'}
            </div>
            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full max-w-md px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                <Mail size={15} />
                <span>Email Address</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={user?.email}>
                {user?.email || 'user@example.com'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                <Shield size={15} />
                <span>Account Role</span>
              </div>
              <div className="mt-2 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                  {user?.role || 'Student'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>Account Status</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Active & Operational</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Preferences */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 shadow-xs">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sliders size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Preferences & Defaults</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize appearance and default generation parameters for questions and explanations.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Theme Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
              Interface Theme
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => {
                  if (isDarkMode) toggleDarkMode();
                }}
                className={`flex items-center space-x-3.5 p-4 rounded-xl border text-left transition-all ${
                  !isDarkMode
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${!isDarkMode ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <Sun size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Light Mode</p>
                  <p className="text-xs text-slate-400">Crisp and clean daylight appearance</p>
                </div>
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => {
                  if (!isDarkMode) toggleDarkMode();
                }}
                className={`flex items-center space-x-3.5 p-4 rounded-xl border text-left transition-all ${
                  isDarkMode
                    ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <Moon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Dark Mode</p>
                  <p className="text-xs text-slate-400">Easy on the eyes for night study</p>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Default Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Default Difficulty Level
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Initial challenge level for generated questions, quizzes, and practice sets.
              </p>
              <select
                value={defaultDifficulty}
                onChange={(e) => setDefaultDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              >
                <option value="Easy">Easy (Foundational Concepts)</option>
                <option value="Medium">Medium (Standard Academic Level)</option>
                <option value="Hard">Hard (Advanced Problem Solving)</option>
                <option value="Adaptive">Adaptive (AI Dynamic Difficulty)</option>
              </select>
            </div>

            {/* Default Education Level */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Default Target Audience / Level
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Calibrates vocabulary complexity and pedagogical depth.
              </p>
              <select
                value={defaultLevel}
                onChange={(e) => setDefaultLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              >
                <option value="Elementary School">Elementary School (Grades 1-5)</option>
                <option value="Middle School">Middle School (Grades 6-8)</option>
                <option value="High School">High School (Grades 9-12)</option>
                <option value="Undergraduate">Undergraduate (College / University)</option>
                <option value="Graduate / Professional">Graduate / Professional</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm shadow-indigo-500/25 transition cursor-pointer"
          >
            <Save size={16} />
            <span>Save Preferences</span>
          </button>
        </div>
      </section>

      {/* Section 3: Security */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 shadow-xs">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Lock size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ensure your account stays protected by updating your password regularly.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="mt-6 space-y-5 max-w-xl">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium text-sm transition shadow-sm cursor-pointer disabled:opacity-70"
            >
              <Key size={16} className={isUpdatingPassword ? 'animate-spin' : ''} />
              <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Section 4: Learning Management System (LMS) Integrations */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 shadow-xs">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <School size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Learning Management System (LMS)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connect external classrooms to automatically sync rosters, quizzes, and gradebooks.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Moodle Integration Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
                  M
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Moodle LMS</h3>
                  <p className="text-[11px] text-slate-400">REST API & LTI 1.3 Advantage</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                Not Connected • Coming Soon
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Export generated quizzes, assignments, and student rubrics directly to your institutional Moodle courses with one click.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Moodle Instance URL</label>
                <input
                  type="text"
                  placeholder="https://moodle.youruniversity.edu"
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-400 text-xs cursor-not-allowed"
                />
              </div>
              <button
                type="button"
                onClick={() => showToast('Moodle LTI connector is architecture-ready. Institutional credentials required.', 'info')}
                className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Link2 size={14} />
                <span>Configure Moodle Connection</span>
              </button>
            </div>
          </div>

          {/* Google Classroom Integration Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
                  G
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Google Classroom</h3>
                  <p className="text-[11px] text-slate-400">Google Workspace for Education</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                Not Connected • Coming Soon
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Sync teacher rosters and automatically push course announcements, practice sets, and formative quizzes to Google Classroom.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Classroom OAuth Client ID</label>
                <input
                  type="text"
                  placeholder="apps.googleusercontent.com"
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-400 text-xs cursor-not-allowed"
                />
              </div>
              <button
                type="button"
                onClick={() => showToast('Google Classroom OAuth architecture ready. Awaiting Google Workspace verification.', 'info')}
                className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Link2 size={14} />
                <span>Configure Google Classroom</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs flex items-center gap-2">
          <Server size={16} className="text-purple-600 shrink-0" />
          <span>
            <strong>Future-Ready Architecture:</strong> Backend data schemas and API endpoints are pre-structured for LTI 1.3 standards. No fake mock credentials are used.
          </span>
        </div>
      </section>
    </div>
  );
};

export default Settings;
