import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Users,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

interface TeacherAnalyticsData {
  total_students: number;
  total_quizzes_attempted: number;
  average_class_score: number;
  frequently_incorrect_topics: Array<{ topic: string; average_score: number; attempts: number; difficulty: string }>;
  recent_student_activity: Array<{ id: number; student_name: string; student_email: string; topic: string; score: number; total: number; percentage: number; date: string }>;
  topic_performance_breakdown: Array<{ topic: string; average_score: number; attempts: number; difficulty: string }>;
}

const TeacherAnalytics: React.FC = () => {
  const [data, setData] = useState<TeacherAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/teacher/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load teacher analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-500">
        <span>Loading classroom analytics and performance breakdown...</span>
      </div>
    );
  }

  const hasData = data && data.total_quizzes_attempted > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 mb-2">
          <GraduationCap size={13} className="text-indigo-500" />
          <span>Faculty Overview</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Teacher Analytics & Class Insights
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Real-time aggregated diagnostic insights across your students' quiz participation, common curriculum bottlenecks, and student performance.
        </p>
      </div>

      {hasData ? (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Students</span>
                <Users size={18} className="text-indigo-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{data.total_students || 1}</p>
              <p className="text-xs text-slate-500 mt-1">Enrolled and active student accounts</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Quiz Attempts</span>
                <BarChart3 size={18} className="text-purple-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{data.total_quizzes_attempted}</p>
              <p className="text-xs text-slate-500 mt-1">Submitted formative assessments</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Average Class Score</span>
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{data.average_class_score}%</p>
              <p className="text-xs text-slate-500 mt-1">Classroom mastery level</p>
            </div>
          </div>

          {/* Dual Column: Bottleneck Topics & Student Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Frequently Incorrect Topics (Left 6 Cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Frequently Incorrect Topics (Curriculum Bottlenecks)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">&lt; 65% Avg</span>
                </div>

                {data.frequently_incorrect_topics.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">
                    Excellent! No topics currently register below 65% average score.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.frequently_incorrect_topics.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{t.topic}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {t.attempts} total student attempts
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                            {t.average_score}% Avg
                          </span>
                          <span className="block text-[10px] text-rose-500 font-semibold">Needs Revision</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Topic Performance Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
                  All Topics Performance Breakdown
                </h3>
                <div className="space-y-2.5">
                  {data.topic_performance_breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{item.topic}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.attempts} attempts recorded</p>
                      </div>
                      <span className={`text-xs font-extrabold ${
                        item.average_score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {item.average_score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Student Submissions (Right 6 Cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Student Activity</h3>
                  <span className="text-xs text-slate-400">Live submission feed</span>
                </div>

                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                  {data.recent_student_activity.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">{act.student_name}</p>
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">{act.topic}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{act.date}</p>
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
          <BarChart3 size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Student Submissions Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Once students take quizzes or complete practice question sessions, comprehensive class metrics, frequently missed concepts, and scores will populate here.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeacherAnalytics;
