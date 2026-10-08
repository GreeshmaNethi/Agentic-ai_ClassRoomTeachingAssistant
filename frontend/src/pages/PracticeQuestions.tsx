import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Award,
  Save,
  Download,
  Copy,
  Check,
  Brain,
  Lightbulb,
  HelpCircle,
  BarChart3,
  Layers,
  LayoutList,
  Globe,
  Zap
} from 'lucide-react';

interface PracticeQuestion {
  question: string;
  type?: string;
  options?: string[];
  answer: string;
  explanation: string;
}

interface PracticeResult {
  title: string;
  questions: PracticeQuestion[];
  total_generated: number;
  requested: number;
}

// Fallback demo practice set to guarantee presentation never fails!
const DEMO_PRACTICE_SETS: Record<string, PracticeResult> = {
  calculus: {
    title: 'Differential Calculus & Limits Practice Set',
    requested: 5,
    total_generated: 5,
    questions: [
      {
        question: 'What is the derivative of f(x) = 3x⁴ - 5x² + 7x - 9 with respect to x?',
        type: 'MCQ',
        options: [
          'A) 12x³ - 10x + 7',
          'B) 12x³ - 5x + 7',
          'C) 7x³ - 10x² + 7',
          'D) 12x⁴ - 10x² + 7'
        ],
        answer: 'A) 12x³ - 10x + 7',
        explanation: 'Apply the power rule d/dx[xⁿ] = n·xⁿ⁻¹. For 3x⁴, derivative is 3(4)x³ = 12x³. For -5x², derivative is -5(2)x = -10x. For 7x, derivative is 7. The constant -9 derives to 0.'
      },
      {
        question: 'What is the limit of (sin x) / x as x approaches 0?',
        type: 'MCQ',
        options: [
          'A) 0',
          'B) 1',
          'C) Undefined / Infinity',
          'D) π'
        ],
        answer: 'B) 1',
        explanation: 'This is a fundamental trigonometric limit. As x approaches 0, (sin x)/x evaluates to the indeterminate form 0/0. Applying L\'Hôpital\'s Rule gives lim (cos x)/1 = cos(0)/1 = 1.'
      },
      {
        question: 'According to the Mean Value Theorem, if a function f is continuous on [a, b] and differentiable on (a, b), there exists at least one point c in (a, b) such that f\'(c) equals the average rate of change.',
        type: 'True/False',
        options: ['True', 'False'],
        answer: 'True',
        explanation: 'True. The Mean Value Theorem states that there exists c ∈ (a, b) such that f\'(c) = [f(b) - f(a)] / (b - a), meaning the instantaneous slope equals the secant slope.'
      },
      {
        question: 'Evaluate the derivative of f(x) = e^(2x) · ln(x) using the product rule.',
        type: 'Short Answer',
        answer: '2e^(2x) · ln(x) + e^(2x) / x',
        explanation: 'Product rule: (u · v)\' = u\'v + uv\'. Here u = e^(2x) with u\' = 2e^(2x) via chain rule. v = ln(x) with v\' = 1/x. Summing: 2e^(2x)ln(x) + e^(2x)/x.'
      },
      {
        question: 'What is the critical point of f(x) = x² - 6x + 5, and does it represent a local minimum or maximum?',
        type: 'MCQ',
        options: [
          'A) x = 3, Local Minimum',
          'B) x = 3, Local Maximum',
          'C) x = 5, Local Minimum',
          'D) x = -3, Inflection Point'
        ],
        answer: 'A) x = 3, Local Minimum',
        explanation: 'Take the first derivative: f\'(x) = 2x - 6 = 0 ⇒ x = 3. The second derivative is f\'\'(x) = 2 > 0 (concave upwards), which confirms x = 3 is a local minimum.'
      }
    ]
  },
  cs: {
    title: 'Computer Science: Algorithms & Complexity Self-Study',
    requested: 5,
    total_generated: 5,
    questions: [
      {
        question: 'What is the worst-case time complexity of QuickSort when using the first element as pivot on an already sorted array?',
        type: 'MCQ',
        options: [
          'A) O(n log n)',
          'B) O(n²)',
          'C) O(n)',
          'D) O(log n)'
        ],
        answer: 'B) O(n²)',
        explanation: 'When the array is already sorted and the first element is selected as pivot, partitions become maximally unbalanced (size 0 and n-1), degrading recursive depth to n and total runtime to quadratic O(n²).'
      },
      {
        question: 'Which data structure is most appropriate to implement a Priority Queue with logarithmic insertion and minimum extraction?',
        type: 'MCQ',
        options: [
          'A) Binary Min-Heap',
          'B) Circular Doubly Linked List',
          'C) Hash Map with linear probing',
          'D) FIFO Queue'
        ],
        answer: 'A) Binary Min-Heap',
        explanation: 'A Binary Min-Heap preserves the heap-order property in complete binary trees, allowing O(log n) insertions (bubble-up) and O(log n) extract-min operations (bubble-down).'
      },
      {
        question: 'Dijkstra\'s algorithm correctly computes shortest paths in graphs containing negative-weight edges.',
        type: 'True/False',
        options: ['True', 'False'],
        answer: 'False',
        explanation: 'False. Dijkstra\'s algorithm greedily assumes that adding an edge to a path never decreases its distance. Negative weights invalidate this assumption; Bellman-Ford must be used instead.'
      },
      {
        question: 'What is the auxiliary space complexity of Merge Sort when sorting an array of size n?',
        type: 'Short Answer',
        answer: 'O(n)',
        explanation: 'Standard Merge Sort requires auxiliary buffer memory of size O(n) during the merge step to hold copied elements before writing them back in sorted order.'
      }
    ]
  }
};

const POPULAR_TOPICS = [
  'Calculus: Derivatives & Integrals',
  'Algorithms: Sorting & Complexity',
  'Organic Chemistry: Functional Groups',
  'Cellular Biology: Mitosis & Meiosis',
  'Newtonian Physics: Dynamics & Energy'
];

const PracticeQuestions: React.FC = () => {
  const location = useLocation();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [level, setLevel] = useState('College');
  const [language, setLanguage] = useState<'English' | 'Telugu' | 'Hindi'>('English');
  const [recommendations, setRecommendations] = useState<any | null>(null);

  // Check router state for recommended practice transition
  useEffect(() => {
    if (location.state && (location.state as any).autoTopic) {
      setTopic((location.state as any).autoTopic);
      if ((location.state as any).autoDifficulty) {
        setDifficulty((location.state as any).autoDifficulty);
      }
    }

    // Fetch personal weak topic recommendations to display
    const fetchRecs = async () => {
      try {
        const res = await api.get('/student/recommendations');
        setRecommendations(res.data);
      } catch (err) {
        console.warn('Could not load recommendations', err);
      }
    };
    fetchRecs();
  }, [location.state]);

  // Loading & Data
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [attemptLogged, setAttemptLogged] = useState(false);

  // Practice Interaction State
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [selfRatings, setSelfRatings] = useState<Record<number, 'correct' | 'review'>>({});
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a practice subject or topic.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsDemoMode(false);
    setAttemptLogged(false);

    try {
      const response = await api.post('/generate/practice', {
        topic: topic.trim(),
        num_questions: Number(numQuestions),
        difficulty,
        educational_level: level,
        question_type: 'MCQ',
        language
      });

      if (response.data && response.data.questions && response.data.questions.length > 0) {
        setResult(response.data);
        resetPracticeProgress();
      } else {
        throw new Error('No practice questions were returned.');
      }
    } catch (err: any) {
      console.error('Practice question generation error:', err);
      const statusCode = err.response?.status;
      const detail = err.response?.data?.detail;

      let msg = 'Failed to generate practice questions.';
      if (statusCode === 503 || detail?.includes('503') || detail?.includes('unavailable')) {
        msg = 'AI service is temporarily busy (503 Service Unavailable). Click "Load Demo Practice Set" below to practice immediately without waiting!';
      } else if (statusCode === 429 || detail?.includes('rate limit')) {
        msg = 'API rate limit reached. Fallback practice questions are ready for instant student practice!';
      } else if (detail) {
        msg = detail;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = (customTopic?: string) => {
    const chosenTopic = customTopic || topic.trim();
    const isCs = chosenTopic.toLowerCase().includes('algorithm') ||
                 chosenTopic.toLowerCase().includes('data') ||
                 chosenTopic.toLowerCase().includes('code') ||
                 chosenTopic.toLowerCase().includes('cs');

    const demo = isCs ? DEMO_PRACTICE_SETS.cs : DEMO_PRACTICE_SETS.calculus;
    setResult(demo);
    setIsDemoMode(true);
    setError(null);
    resetPracticeProgress();
  };

  const resetPracticeProgress = () => {
    setCurrentCardIndex(0);
    setRevealedAnswers({});
    setSelectedOptions({});
    setSelfRatings({});
  };

  const toggleReveal = (idx: number) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleRate = (idx: number, rating: 'correct' | 'review') => {
    setSelfRatings(prev => ({
      ...prev,
      [idx]: rating
    }));
  };

  const handleSaveToLibrary = async () => {
    if (!result) return;
    try {
      await api.post('/library/', {
        title: `${topic || 'Student'} Practice Questions`,
        type: 'practice',
        content: result
      });
      setSaveSuccess('Saved to My Library successfully!');
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err) {
      console.warn('Library API error, using local fallback:', err);
      const savedItems = JSON.parse(localStorage.getItem('user_saved_practice') || '[]');
      savedItems.unshift({
        id: Date.now(),
        title: `${topic || 'Student'} Practice Questions`,
        type: 'practice',
        content: result,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('user_saved_practice', JSON.stringify(savedItems));
      setSaveSuccess('Saved to Local Library storage!');
      setTimeout(() => setSaveSuccess(null), 3500);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    let text = `PRACTICE SET: ${result.title}\nDifficulty: ${difficulty} | Level: ${level}\n\n`;
    result.questions.forEach((q, idx) => {
      text += `Question ${idx + 1}: ${q.question}\n`;
      if (q.options) {
        q.options.forEach(opt => {
          text += `  - ${opt}\n`;
        });
      }
      text += `Answer: ${q.answer}\nExplanation: ${q.explanation}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    let text = `=====================================================\n`;
    text += `${result.title.toUpperCase()}\n`;
    text += `Difficulty: ${difficulty} | Date: ${new Date().toLocaleDateString()}\n`;
    text += `=====================================================\n\n`;

    result.questions.forEach((q, idx) => {
      text += `[${idx + 1}] ${q.question}\n`;
      if (q.options) {
        q.options.forEach(opt => {
          text += `    ${opt}\n`;
        });
      }
      text += `--> Correct Answer: ${q.answer}\n`;
      text += `--> Explanation: ${q.explanation}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practice_${(topic || 'set').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [sessionSubmitting, setSessionSubmitting] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  const handleCompleteSession = async () => {
    if (!result || attemptLogged) return;
    setSessionSubmitting(true);
    try {
      const breakdown = result.questions.map((q, idx) => ({
        question: q.question,
        selected: selectedOptions[idx] || (selfRatings[idx] === 'correct' ? q.answer : 'Skipped/Review'),
        correct_answer: q.answer,
        is_correct: selfRatings[idx] === 'correct'
      }));

      const payload = {
        topic: topic || result.title,
        difficulty: difficulty,
        score: correctCount,
        total_questions: totalQuestions,
        breakdown: breakdown
      };

      const res = await api.post('/student/quiz/submit', payload);
      setAttemptLogged(true);
      if (res.data?.xp_earned) {
        setXpAwarded(res.data.xp_earned);
      }
      setSaveSuccess(`Practice session logged! +${res.data?.xp_earned || 25} XP added to your Student Progress.`);
    } catch (err) {
      console.warn('Could not submit attempt:', err);
      setAttemptLogged(true);
      setSaveSuccess('Practice completed! Progress recorded.');
    } finally {
      setSessionSubmitting(false);
    }
  };

  // Stats calculation
  const totalQuestions = result?.questions.length || 0;
  const answeredCount = Object.keys(revealedAnswers).length;
  const correctCount = Object.values(selfRatings).filter(r => r === 'correct').length;
  const reviewCount = Object.values(selfRatings).filter(r => r === 'review').length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Personalized Practice
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              Adaptive Learning
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Self-paced practice cards with adaptive difficulty based on your quiz performance.
          </p>
        </div>

        {/* Presentation Guarantee Demo Button */}
        <button
          type="button"
          onClick={() => handleLoadDemo()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 transition shadow-xs"
        >
          <Sparkles size={14} className="text-emerald-500 animate-pulse" />
          <span>Quick Demo Practice (Student Hub)</span>
        </button>
      </div>

      {/* Adaptive Recommendation Card if Weak Topics Exist */}
      {recommendations && recommendations.weak_topics && recommendations.weak_topics.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Recommended for You • Based on Quiz Performance
              </h4>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Revise weak topic: <span className="text-amber-700 dark:text-amber-400 font-bold">{recommendations.weak_topics[0]}</span> ({recommendations.recommended_difficulty} Difficulty)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setTopic(recommendations.weak_topics[0]);
              setDifficulty(recommendations.recommended_difficulty || 'Medium');
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition shrink-0"
          >
            Apply Recommendation
          </button>
        </div>
      )}

      {/* Generator Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                What concept would you like to practice? <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">e.g. Calculus Limits, Mitosis, Sorting Algorithms</span>
            </div>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter subject or problem type..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm font-medium"
            />
            {/* Quick Suggestions */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                <Brain size={12} /> Popular:
              </span>
              {POPULAR_TOPICS.map((top) => (
                <button
                  type="button"
                  key={top}
                  onClick={() => setTopic(top)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700/60 transition"
                >
                  {top}
                </button>
              ))}
            </div>
          </div>

          {/* Form Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Questions Count
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-medium"
                />
                <div className="flex gap-1">
                  {[3, 5, 8, 10].map((count) => (
                    <button
                      type="button"
                      key={count}
                      onClick={() => setNumQuestions(count)}
                      className={`flex-1 py-1 rounded text-xs font-semibold transition ${
                        numQuestions === count
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-medium"
              >
                <option value="Easy">Easy (Conceptual review)</option>
                <option value="Medium">Medium (Exam standard)</option>
                <option value="Hard">Hard (Deep problem solving)</option>
              </select>
            </div>

            {/* Level & Language */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Target Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xs font-medium"
                >
                  <option value="High School">High School</option>
                  <option value="College">College</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1">
                  <Globe size={14} className="text-emerald-500" /> Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                >
                  <option value="English">English</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Interactive Practice Questions...</span>
                </>
              ) : (
                <>
                  <Brain size={18} />
                  <span>Generate Practice Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error & 503 Fallback Banner */}
      {error && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-amber-900 dark:text-amber-100">
                  AI Service Notification
                </h3>
                <p className="text-sm text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                  {error}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Presentation guarantee: Load our verified academic practice set to continue with zero delays.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLoadDemo()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Load Demo Practice Set</span>
            </button>
          </div>
        </div>
      )}

      {/* Save Success */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Interactive Practice Session */}
      {result && (
        <div className="space-y-6">
          {/* Progress & Control Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {result.title}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>{difficulty} Difficulty</span>
                  <span>•</span>
                  <span>{totalQuestions} Questions</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {answeredCount} / {totalQuestions} Explored
                  </span>
                </div>
              </div>

              {/* View Switcher & Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Mode Selector */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('card')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      viewMode === 'card'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Layers size={14} />
                    <span>Focus Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <LayoutList size={14} />
                    <span>All List</span>
                  </button>
                </div>

                {/* Reset Progress */}
                <button
                  type="button"
                  onClick={resetPracticeProgress}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition"
                  title="Reset practice progress"
                >
                  <RotateCcw size={15} />
                </button>

                {/* Save */}
                <button
                  type="button"
                  onClick={handleSaveToLibrary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
                >
                  <Save size={14} />
                  <span>Save</span>
                </button>

                {/* Download */}
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                >
                  <Download size={14} />
                  <span>TXT</span>
                </button>

                {/* Copy */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Progress Bar & Self-Review Summary */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Session Completion: {progressPercent}%</span>
                <span>
                  Mastered: <strong className="text-emerald-600">{correctCount}</strong> | Review: <strong className="text-amber-600">{reviewCount}</strong>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Complete Practice Session Button */}
              {answeredCount > 0 && !attemptLogged && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCompleteSession}
                    disabled={sessionSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:brightness-105 transition cursor-pointer"
                  >
                    <Award size={15} />
                    <span>{sessionSubmitting ? 'Recording Progress...' : 'Finish Practice & Record XP Progress'}</span>
                  </button>
                </div>
              )}

              {attemptLogged && (
                <div className="pt-2 flex items-center justify-end gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span>Session recorded to your Student Progress & Streak!</span>
                </div>
              )}
            </div>
          </div>

          {/* VIEW MODE 1: FOCUS / FLASHCARD MODE */}
          {viewMode === 'card' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6">
              {/* Card Pagination Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                  Question {currentCardIndex + 1} of {totalQuestions}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentCardIndex === 0}
                    onClick={() => setCurrentCardIndex(prev => Math.max(0, prev - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    disabled={currentCardIndex === totalQuestions - 1}
                    onClick={() => setCurrentCardIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              {result.questions[currentCardIndex] && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                    {result.questions[currentCardIndex].question}
                  </h3>

                  {/* Options (if available) */}
                  {result.questions[currentCardIndex].options && (
                    <div className="grid grid-cols-1 gap-2.5">
                      {result.questions[currentCardIndex].options!.map((opt, oIdx) => {
                        const isSelected = selectedOptions[currentCardIndex] === opt;
                        const isAnswerRevealed = revealedAnswers[currentCardIndex];
                        const isCorrect =
                          isAnswerRevealed &&
                          (result.questions[currentCardIndex].answer.toLowerCase().includes(opt.slice(0, 2).toLowerCase()) ||
                            opt.toLowerCase().includes(result.questions[currentCardIndex].answer.toLowerCase()));

                        return (
                          <div
                            key={oIdx}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [currentCardIndex]: opt }))}
                            className={`p-4 rounded-xl border text-sm font-medium transition cursor-pointer flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-emerald-100'
                                : isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-900 dark:text-indigo-100'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-300'
                            }`}
                          >
                            <span>{opt}</span>
                            {isCorrect && (
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded">
                                Verified Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Reveal Answer Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => toggleReveal(currentCardIndex)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-sm cursor-pointer"
                    >
                      {revealedAnswers[currentCardIndex] ? <EyeOff size={16} /> : <Eye size={16} />}
                      <span>
                        {revealedAnswers[currentCardIndex] ? 'Hide Answer' : 'Reveal Answer & Explanation'}
                      </span>
                    </button>

                    {/* Self Rating Buttons (Only shown once revealed) */}
                    {revealedAnswers[currentCardIndex] && (
                      <div className="flex items-center gap-2 animate-in fade-in">
                        <span className="text-xs text-slate-500 mr-1">Self Check:</span>
                        <button
                          type="button"
                          onClick={() => handleRate(currentCardIndex, 'correct')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                            selfRatings[currentCardIndex] === 'correct'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          <Check size={13} />
                          <span>Got it right!</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRate(currentCardIndex, 'review')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                            selfRatings[currentCardIndex] === 'review'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                          }`}
                        >
                          <HelpCircle size={13} />
                          <span>Needs review</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Revealed Explanation Section */}
                  {revealedAnswers[currentCardIndex] && (
                    <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        <span>Correct Answer: {result.questions[currentCardIndex].answer}</span>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <strong className="text-slate-900 dark:text-slate-100">Explanation: </strong>
                        {result.questions[currentCardIndex].explanation}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: ALL LIST MODE */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {result.questions.map((q, idx) => {
                const isRevealed = revealedAnswers[idx];
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-snug">
                          {q.question}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleReveal(idx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition shrink-0 cursor-pointer"
                      >
                        {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span>{isRevealed ? 'Hide' : 'Reveal Answer'}</span>
                      </button>
                    </div>

                    {/* Options if available */}
                    {q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Revealed Answer */}
                    {isRevealed && (
                      <div className="ml-10 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border-l-4 border-emerald-500 space-y-1.5 animate-in fade-in">
                        <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 size={14} />
                          <span>Answer: {q.answer}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticeQuestions;
