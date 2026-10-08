import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  GraduationCap,
  HelpCircle,
  BookOpen,
  FileQuestion,
  ListChecks,
  FileText,
  Library,
  Settings,
  Sparkles,
  UploadCloud,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', icon: <LayoutDashboard size={19} />, label: 'Dashboard', exact: true },
  { to: '/study-material', icon: <UploadCloud size={19} />, label: 'Study Material AI' },
  { to: '/progress', icon: <TrendingUp size={19} />, label: 'Student Progress' },
  { to: '/assistant', icon: <Bot size={19} />, label: 'AI Assistant' },
  { to: '/practice', icon: <HelpCircle size={19} />, label: 'Personalized Practice' },
  { to: '/quiz', icon: <FileQuestion size={19} />, label: 'Quiz Generator' },
  { to: '/mcq', icon: <ListChecks size={19} />, label: 'MCQ Generator' },
  { to: '/assignment', icon: <FileText size={19} />, label: 'Assignment Generator' },
  { to: '/concept', icon: <GraduationCap size={19} />, label: 'Concept Explainer' },
  { to: '/summarize', icon: <BookOpen size={19} />, label: 'Topic Summarizer' },
  { to: '/library', icon: <Library size={19} />, label: 'My Library' },
  { to: '/settings', icon: <Settings size={19} />, label: 'Settings' },
];

const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen flex flex-col transition-colors z-20 shrink-0">
      {/* Brand Logo Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <GraduationCap size={22} />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1">
            EduAssist <Sparkles size={13} className="text-indigo-500 fill-indigo-500" />
          </h1>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">AI Teaching Assistant</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center space-x-3.5 px-4 py-2.5 rounded-full text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-500/25 dark:shadow-indigo-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-slate-800/60 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer User Badge */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs uppercase">
            {user?.email?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.email || 'Logged In'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'User'} Mode</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
