import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Sparkles, Mail, Lock, Eye, EyeOff, BookOpen, GraduationCap, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email.trim());
      formData.append('password', password);
      
      const { data } = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      let userObj = data.user;
      if (!userObj) {
        const userResp = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${data.access_token}` }
        });
        userObj = userResp.data;
      }
      
      setAuth(userObj, data.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Column: Colorful Hero Feature Showcase */}
      <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 p-12 flex-col justify-between border-r border-slate-800">
        {/* Ambient Gradient Glow Orbs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">Agentic AI Classroom</h1>
            <p className="text-xs font-semibold text-indigo-300">Teaching & Learning Assistant</p>
          </div>
        </div>

        {/* Hero Copy & Value Props */}
        <div className="relative z-10 max-w-xl my-auto space-y-8 py-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck size={14} className="text-indigo-400" />
            <span>Empower Teachers • Personalize Student Learning</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Next-Gen AI Workflows for Modern Education.
          </h2>

          <p className="text-slate-300 text-base leading-relaxed">
            Reduce prep time from hours to seconds. Generate quizzes, custom MCQs, syllabus summaries, and step-by-step concept guides in real time.
          </p>

          {/* Feature Badges */}
          <div className="space-y-4 pt-2">
            {[
              { title: 'Intelligent Batch Quiz Generator', desc: 'Create 10 to 100+ items with complete step-by-step solution keys.', icon: <BookOpen className="text-indigo-400" size={20} /> },
              { title: 'Adaptive Concept Explainer', desc: 'Explain complex topics tailored to middle school through college level.', icon: <GraduationCap className="text-violet-400" size={20} /> },
              { title: 'Automatic History & Library Sync', desc: 'All generations are persisted and instantly organized in your library.', icon: <CheckCircle2 className="text-emerald-400" size={20} /> },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{feature.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 flex justify-between items-center pt-6 border-t border-slate-800/60">
          <span>© 2026 Agentic AI Classroom Assistant</span>
          <span className="text-indigo-400 font-semibold">Faculty & Student Ready</span>
        </div>
      </div>

      {/* Right Column: Modern Sign-In Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-12 bg-slate-950 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header Branding */}
          <div className="lg:hidden text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold mx-auto shadow-lg shadow-indigo-500/30">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-black text-white">Agentic AI Classroom</h1>
            <p className="text-xs text-slate-400">Teaching & Learning Assistant</p>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
            <p className="text-sm text-slate-400 mt-2">
              Sign in to access your dashboard, AI generators, and saved library materials.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm cursor-pointer"
            >
              {loading ? (
                <span>Authenticating Workspace...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Info Box for Faculty Presentation */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 text-xs text-indigo-300 space-y-1">
            <p className="font-semibold text-indigo-200 flex items-center gap-1">
              <Sparkles size={13} /> Demo Quick Access:
            </p>
            <p className="text-slate-400">
              Registered Email: <code className="text-indigo-300 font-mono">nethigreeshma@gmail.com</code>
            </p>
          </div>

          {/* Register Link */}
          <p className="text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold underline transition">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
