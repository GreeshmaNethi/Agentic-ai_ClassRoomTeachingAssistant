import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  BookOpen,
  Target,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Brain,
  Zap,
  BarChart2,
  Calendar,
  Sparkles,
  Trophy,
  Activity
} from 'lucide-react';

interface ProgressData {
  quizzes_attempted: number;
  average_score: number;
  questions_answered: number;
  total_correct: number;
  accuracy: number;
  strong_topics: Array<{ topic: string; accuracy: number; attempts: number; total_questions: number }>;
  weak_topics: Array<{ topic: string; accuracy: number; attempts: number; total_questions: number }>;
  completed_topics: string[];
  recent_activity: Array<{ id: number; topic: string; difficulty: string; score: number; total: number; percentage: number; date: string }>;
  recommended_next_topic: string | null;
  recommended_difficulty: string;
}

interface GamificationData {
  xp: number;
  level: number;
  streak_days: number;
  achievements: Array<{ id: string; title: string; description: string; icon: string; unlocked: boolean }>;
  completed_quizzes_count: number;
}

interface RecommendationData {
  recommended_topics: Array<{ topic: string; reason: string; difficulty: string }>;
  weak_topics_to_revise: string[];
  suggested_difficulty: string;
  learning_streak: number;
}

const StudentProgress: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [progRes, gamRes, recRes] = await Promise.all([
          api.get('/student/progress'),
          api.get('/student/gamification'),
          api.get('/student/recommendations')
        ]);
        setProgress(progRes.data);
        setGamification(gamRes.data);
        setRecommendations(recRes.data);
      } catch (err) {
        console.error('Failed to load student progress', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const startRevision = (topic: string, diff: string) => {
    navigate('/practice', { state: { autoTopic: topic, autoDifficulty: diff } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-500">
        <span>Loading academic progress & learning analytics...</span>
      </div>
    );
  }

  const hasData = progress && progress.quizzes_attempted > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 mb-2">
            <Activity size={13} className="text-emerald-500" />
            <span>Academic Performance Tracker</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Student Progress Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Track your actual quiz attempts, accuracy rates, mastered competencies, and personalized revision recommendations.
          </p>
        </div>

        {/* Gamification Quick Snapshot Badge */}
        {gamification && (
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 self-start md:self-auto shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20">
              <Flame size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {gamification.streak_days} Day Streak
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                  Level {gamification.level}
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {gamification.xp} XP Earned
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recommended for You Section (Agentic Recommendation Flow) */}
      {recommendations && recommendations.recommended_topics.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-800/60 p-6 md:p-8 text-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
                <Zap size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Recommended for You</h2>
                <p className="text-xs text-indigo-200">
                  Adaptive AI insights based on your recent attempt accuracy and weak topics.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-indigo-200 border border-white/10">
              Recommended Difficulty: {recommendations.suggested_difficulty}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {recommendations.recommended_topics.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 hover:border-indigo-400/50 rounded-xl p-5 flex flex-col justify-between space-y-3 backdrop-blur-sm transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-indigo-300 capitalize">{rec.difficulty} Difficulty</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">Action</span>
                  </div>
                  <h3 className="font-bold text-white text-sm line-clamp-1">{rec.topic}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.reason}</p>
                </div>

                <button
                  type="button"
                  onClick={() => startRevision(rec.topic, rec.difficulty)}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <span>Practice This Topic</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Performance Metrics Cards */}
      {hasData ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Quizzes Attempted</span>
                <BookOpen size={18} className="text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{progress.quizzes_attempted}</p>
              <p className="text-[11px] text-slate-500 mt-1">Total completed evaluation sets</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{progress.average_score}%</p>
              <p className="text-[11px] text-slate-500 mt-1">Across all attempted modules</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Questions Answered</span>
                <Target size={18} className="text-purple-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{progress.questions_answered}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                <strong className="text-emerald-600">{progress.total_correct}</strong> answered correctly
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Overall Accuracy</span>
                <CheckCircle2 size={18} className="text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{progress.accuracy}%</p>
              <p className="text-[11px] text-slate-500 mt-1">First-pass accuracy rate</p>
            </div>
          </div>

          {/* Dual Column: Weak vs Strong Topics & Recent Attempts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 6 Columns: Competency Breakdown (Strong & Weak Topics) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Weak Topics Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Topics to Revise (Weak Competencies)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">&lt; 70% Accuracy</span>
                </div>

                {progress.weak_topics.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">
                    Great job! You have no weak topics below 70% accuracy.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {progress.weak_topics.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{item.topic}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.attempts} attempts • {item.total_questions} questions
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                            {item.accuracy}%
                          </span>
                          <button
                            type="button"
                            onClick={() => startRevision(item.topic, 'Medium')}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition"
                          >
                            Revise
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Strong Topics Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Mastered Competencies (Strong Topics)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">&ge; 70% Accuracy</span>
                </div>

                {progress.strong_topics.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">Complete more practice sets to establish strong competencies.</p>
                ) : (
                  <div className="space-y-3">
                    {progress.strong_topics.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{item.topic}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.attempts} attempts • {item.total_questions} questions
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            {item.accuracy}%
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                            Mastered
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 6 Columns: Recent Activity History */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Activity History</h3>
                  <span className="text-xs text-slate-400 font-semibold">Latest attempts</span>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {progress.recent_activity.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{act.topic}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize">
                            {act.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{act.date}</p>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-black ${
                          act.percentage >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {act.score} / {act.total} ({act.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center shadow-xs">
          <BarChart2 size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Assessment Data Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Complete your first Quiz or Practice Question set. Your performance, accuracy, and topic breakdown will appear right here automatically.
          </p>
          <button
            type="button"
            onClick={() => navigate('/practice')}
            className="mt-4 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
          >
            Start First Practice Session
          </button>
        </div>
      )}

      {/* Gamification Achievements Showcase */}
      {gamification && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Badges & Achievements
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {gamification.achievements.filter(a => a.unlocked).length} / {gamification.achievements.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
            {gamification.achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition text-center flex flex-col items-center justify-between ${
                  ach.unlocked
                    ? 'border-amber-400/80 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 opacity-50 grayscale'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold mb-2">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ach.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">{ach.description}</p>
                </div>
                <div className="mt-3">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    ach.unlocked
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {ach.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgress;
