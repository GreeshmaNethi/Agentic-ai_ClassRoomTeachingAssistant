import React, { useEffect, useState } from 'react';
import { useAuthStore, getUserDisplayName } from '../store/authStore';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { BookOpen, FileQuestion, Library, PenTool, Sparkles, GraduationCap, FileText, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [recentMaterials, setRecentMaterials] = useState([]);

  const displayName = getUserDisplayName(user);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const { data } = await api.get('/library');
        setRecentMaterials(data.slice(0, 4));
      } catch (err) {
        console.error(err);
      }
    };
    fetchLibrary();
  }, []);

  const getQuickActions = () => {
    if (user?.role === 'teacher') {
      return [
        { label: 'Generate MCQs', icon: <FileQuestion className="text-blue-500" size={24} />, to: '/mcq', desc: 'Create question sets with options & keys' },
        { label: 'Create a Quiz', icon: <PenTool className="text-emerald-500" size={24} />, to: '/quiz', desc: 'Batch quiz generation (up to 100+ items)' },
        { label: 'Summarize Topic', icon: <BookOpen className="text-purple-500" size={24} />, to: '/summarize', desc: 'Synthesize lecture notes & articles' },
        { label: 'Assignment Generator', icon: <FileText className="text-indigo-500" size={24} />, to: '/assignment', desc: 'Structured rubrics & student tasks' },
      ];
    }
    return [
      { label: 'Ask AI Assistant', icon: <Sparkles className="text-indigo-500" size={24} />, to: '/assistant', desc: 'Instant 24/7 AI tutor & study helper' },
      { label: 'Practice Questions', icon: <FileQuestion className="text-emerald-500" size={24} />, to: '/practice', desc: 'Interactive self-assessment with answers' },
      { label: 'Explain Concept', icon: <GraduationCap className="text-purple-500" size={24} />, to: '/concept', desc: 'Step-by-step breakdowns & real examples' },
      { label: 'Topic Summarizer', icon: <BookOpen className="text-blue-500" size={24} />, to: '/summarize', desc: 'Quick bulleted overviews of any topic' },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white p-8 rounded-3xl shadow-xl shadow-indigo-600/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-100 mb-3 border border-white/10">
            <Sparkles size={12} />
            <span className="capitalize">{user?.role || 'Student'} Workspace</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {displayName}!</h1>
          <p className="text-indigo-100 text-sm mt-1.5 max-w-xl">
            Here's your {user?.role || 'student'} dashboard. Explore AI-powered educational generators, interactive study tools, and your saved material library.
          </p>
        </div>
        <Link
          to="/library"
          className="px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-2xl text-xs shadow-md transition-all flex items-center space-x-2 shrink-0"
        >
          <Library size={16} />
          <span>My Library</span>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Quick AI Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getQuickActions().map((action, i) => (
            <Link
              key={i}
              to={action.to}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform">
                  {action.icon}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{action.label}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{action.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                <span>Start Now</span>
                <ArrowRight size={14} className="ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Materials */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Saved Library Materials</h2>
          <Link to="/library" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            View All Materials &rarr;
          </Link>
        </div>

        {recentMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentMaterials.map((item: any) => (
              <Link
                to="/library"
                key={item.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {item.type}
                  </span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-3 line-clamp-2">{item.title}</h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  Created {new Date(item.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No materials saved yet. Generated items will automatically appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
