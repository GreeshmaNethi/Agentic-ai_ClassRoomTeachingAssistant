import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { api } from './services/api';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MCQGenerator from './pages/MCQGenerator';
import QuizGenerator from './pages/QuizGenerator';
import AssignmentGenerator from './pages/AssignmentGenerator';
import TopicSummarizer from './pages/TopicSummarizer';
import ConceptExplainer from './pages/ConceptExplainer';
import PracticeQuestions from './pages/PracticeQuestions';
import Library from './pages/Library';
import AIAssistant from './pages/AIAssistant';
import Settings from './pages/Settings';
import StudyMaterialAI from './pages/StudyMaterialAI';
import StudentProgress from './pages/StudentProgress';

function App() {
  const { user, token, setAuth, logout } = useAuthStore();
  const [loading, setLoading] = useState(() => !user && !!token);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchUser = async () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        if (active) setLoading(false);
        return;
      }
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth request timed out')), 2500)
        );
        const { data } = (await Promise.race([
          api.get('/auth/me'),
          timeoutPromise
        ])) as any;
        if (active && data) {
          setAuth(data, currentToken);
        }
      } catch (error: any) {
        console.warn("Auth check error or timeout:", error);
        if (error?.response?.status === 401) {
          logout();
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchUser();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-ping"></div>
          <span className="text-lg font-medium text-slate-300">Loading Assistant...</span>
        </div>
      </div>
    );
  }

  return (
    <Router basename="/Agentic-ai_ClassRoomTeachingAssistant">
      <Routes>
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="mcq" element={<MCQGenerator />} />
          <Route path="quiz" element={<QuizGenerator />} />
          <Route path="assignment" element={<AssignmentGenerator />} />
          <Route path="summarize" element={<TopicSummarizer />} />
          <Route path="concept" element={<ConceptExplainer />} />
          <Route path="practice" element={<PracticeQuestions />} />
          <Route path="study-material" element={<StudyMaterialAI />} />
          <Route path="progress" element={<StudentProgress />} />
          <Route path="library" element={<Library />} />
          <Route path="assistant" element={<AIAssistant />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
