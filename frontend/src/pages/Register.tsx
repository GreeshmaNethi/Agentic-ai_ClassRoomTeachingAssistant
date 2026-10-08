import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Mail, Lock, User, Shield, ArrowRight, CheckCircle2, BookOpen, GraduationCap } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        role
      });

      // Auto login after successful registration
      const formData = new URLSearchParams();
      formData.append('username', email.trim());
      formData.append('password', password);

      const { data } = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      setAuth(data.user, data.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your details.');
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
            <Sparkles size={14} className="text-indigo-400" />
            <span>Join Thousands of Educators & Students</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Create Your Intelligent Educational Workspace.
          </h2>

          <p className="text-slate-300 text-base leading-relaxed">
            Register as a Teacher to generate full assignments, quizzes, and MCQs — or as a Student to ask questions, explain hard concepts, and generate self-assessment sets.
          </p>

          {/* Feature Badges */}
          <div className="space-y-4 pt-2">
            {[
              { title: 'Teacher Dashboard', desc: 'Syllabus summarizer, batch quiz generator, and assignment rubrics.', icon: <BookOpen className="text-indigo-400" size={20} /> },
              { title: 'Student Dashboard', desc: 'Interactive AI tutor, concept explainer, and step-by-step practice mode.', icon: <GraduationCap className="text-violet-400" size={20} /> },
              { title: 'Personalized Learning', desc: 'Adapts vocabulary and difficulty dynamically to elementary, high school, or college.', icon: <CheckCircle2 className="text-emerald-400" size={20} /> },
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

      {/* Right Column: Modern Registration Form */}
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
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
            <p className="text-sm text-slate-400 mt-2">
              Get started by setting up your profile and choosing your role.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Greeshma Nethi"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
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
                  placeholder="you@domain.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Account Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Shield size={18} />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  <option value="student">Student Account</option>
                  <option value="teacher">Teacher Account</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm cursor-pointer mt-2"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Sign Up & Get Started</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold underline transition">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
