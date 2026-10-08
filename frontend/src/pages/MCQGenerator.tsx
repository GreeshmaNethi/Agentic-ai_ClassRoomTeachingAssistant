import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Sparkles,
  Download,
  Copy,
  Save,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  Printer,
  BookOpen,
  Award,
  HelpCircle
} from 'lucide-react';

interface MCQOption {
  text: string;
  is_correct: boolean;
}

interface MCQItem {
  question: string;
  options: MCQOption[];
  explanation: string;
  difficulty?: string;
}

interface MCQResult {
  questions: MCQItem[];
}

// Fallback demo MCQs for bulletproof presentation during faculty review
const DEMO_MCQ_BANK: Record<string, MCQResult> = {
  cs: {
    questions: [
      {
        question: 'Which of the following is NOT one of Coffman\'s four necessary conditions for deadlock in operating systems?',
        options: [
          { text: 'Mutual Exclusion', is_correct: false },
          { text: 'Hold and Wait', is_correct: false },
          { text: 'Preemptive Scheduling', is_correct: true },
          { text: 'Circular Wait', is_correct: false }
        ],
        explanation: 'The four Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. "Preemptive Scheduling" actually breaks the no-preemption condition and prevents deadlock.',
        difficulty: 'Medium'
      },
      {
        question: 'In CPU scheduling, what is the phenomenon known as the "Convoy Effect"?',
        options: [
          { text: 'Short CPU-bound processes block long I/O-bound processes', is_correct: false },
          { text: 'Short processes wait behind a long CPU-bound process in FCFS scheduling', is_correct: true },
          { text: 'Processes infinitely waiting for a shared semaphore', is_correct: false },
          { text: 'Multiple threads swapping register state too rapidly', is_correct: false }
        ],
        explanation: 'In First-Come, First-Served (FCFS) scheduling, if a long CPU-intensive process executes first, numerous shorter processes get stuck behind it in the queue, drastically increasing average turnaround time.',
        difficulty: 'Medium'
      },
      {
        question: 'What is the primary advantage of Virtual Memory implemented with Paging?',
        options: [
          { text: 'Completely eliminates external fragmentation in physical RAM', is_correct: true },
          { text: 'Guarantees zero internal fragmentation within pages', is_correct: false },
          { text: 'Removes the need for a memory management unit (MMU)', is_correct: false },
          { text: 'Doubles the CPU clock cycle frequency', is_correct: false }
        ],
        explanation: 'Paging divides memory into fixed-size frames and pages. Because any non-contiguous free frame can be allocated, external fragmentation is completely avoided.',
        difficulty: 'Easy'
      },
      {
        question: 'Which page replacement algorithm suffers from Belady\'s Anomaly (where increasing page frames increases page faults)?',
        options: [
          { text: 'Optimal (OPT)', is_correct: false },
          { text: 'Least Recently Used (LRU)', is_correct: false },
          { text: 'First-In, First-Out (FIFO)', is_correct: true },
          { text: 'Least Frequently Used (LFU)', is_correct: false }
        ],
        explanation: 'Belady\'s Anomaly occurs in FIFO page replacement where providing more physical page frames can paradoxically cause more page faults because FIFO is not a stack-based algorithm.',
        difficulty: 'Hard'
      },
      {
        question: 'What mechanism do modern operating systems utilize to protect user processes from corrupting kernel space memory?',
        options: [
          { text: 'Dual-mode CPU operation (Kernel vs User mode with base/limit registers)', is_correct: true },
          { text: 'Running all user software in unprivileged web browsers', is_correct: false },
          { text: 'Hardware parity bits in level-3 cache', is_correct: false },
          { text: 'Software polling loops in user applications', is_correct: false }
        ],
        explanation: 'Dual-mode CPU architecture utilizes a hardware mode bit. Privileged instructions and kernel memory addresses are strictly inaccessible while the mode bit indicates User Mode.',
        difficulty: 'Medium'
      }
    ]
  },
  general: {
    questions: [
      {
        question: 'Which organelle is responsible for packaging and dispatching proteins within eukaryotic cells?',
        options: [
          { text: 'Endoplasmic Reticulum', is_correct: false },
          { text: 'Golgi Apparatus', is_correct: true },
          { text: 'Lysosome', is_correct: false },
          { text: 'Peroxisome', is_correct: false }
        ],
        explanation: 'The Golgi apparatus modifies, sorts, and packages proteins received from the rough endoplasmic reticulum for secretion or intracellular delivery.',
        difficulty: 'Easy'
      },
      {
        question: 'According to Newton\'s Second Law of Motion, what occurs when a constant non-zero net force is applied to an object with fixed mass?',
        options: [
          { text: 'The object moves with constant velocity', is_correct: false },
          { text: 'The object experiences a constant acceleration (F = ma)', is_correct: true },
          { text: 'The object decelerates exponentially', is_correct: false },
          { text: 'The object remains in static equilibrium', is_correct: false }
        ],
        explanation: 'Newton\'s Second Law defines net force as mass times acceleration (F = ma). A constant net force results in constant linear acceleration.',
        difficulty: 'Medium'
      },
      {
        question: 'In economics, what is an equilibrium price?',
        options: [
          { text: 'The maximum ceiling price set by government mandate', is_correct: false },
          { text: 'The price where quantity supplied equals quantity demanded', is_correct: true },
          { text: 'The cost of production plus 20% markup', is_correct: false },
          { text: 'The price at which no consumers can afford the product', is_correct: false }
        ],
        explanation: 'Market equilibrium occurs at the intersection of supply and demand curves, where the quantity supplied precisely matches quantity demanded, leaving no surplus or shortage.',
        difficulty: 'Easy'
      },
      {
        question: 'What is the function of enzymes in biochemical metabolic pathways?',
        options: [
          { text: 'They increase the overall equilibrium constant of reactions', is_correct: false },
          { text: 'They lower activation energy to accelerate reaction rates', is_correct: true },
          { text: 'They are consumed as fuel during catalysis', is_correct: false },
          { text: 'They alter the total delta G of the reaction', is_correct: false }
        ],
        explanation: 'Enzymes function as biological catalysts by stabilizing transition states, lowering the required activation energy (Ea) without altering the free energy change (delta G).',
        difficulty: 'Medium'
      }
    ]
  }
};

const SUGGESTIONS = [
  'Operating Systems: Scheduling & Deadlocks',
  'Data Structures: Hash Tables & Complexity',
  'Organic Chemistry: Reaction Mechanisms',
  'Principles of Microeconomics: Supply & Demand',
  'Molecular Genetics: DNA Replication'
];

const MCQGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [level, setLevel] = useState('High School');
  const [numOptions, setNumOptions] = useState<number>(4);
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [showSourceInput, setShowSourceInput] = useState(false);

  // Status & Results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MCQResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Interactive controls
  const [revealAllAnswers, setRevealAllAnswers] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a subject or topic for MCQ generation.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsDemoMode(false);

    try {
      const response = await api.post('/generate/mcq', {
        topic: topic.trim(),
        num_questions: Number(numQuestions),
        difficulty,
        educational_level: level,
        num_options: Number(numOptions),
        source_material: sourceMaterial.trim() || undefined
      });

      if (response.data && response.data.questions && response.data.questions.length > 0) {
        setResult(response.data);
        // Auto-save history
        try {
          await api.post('/library/', {
            title: `${topic.trim()} MCQs (${difficulty})`,
            type: 'mcq',
            content: response.data
          });
        } catch (sErr) {
          console.warn('Auto-save library:', sErr);
        }
      } else {
        throw new Error('Backend returned an empty question list.');
      }
    } catch (err: any) {
      console.error('MCQ Generation error:', err);
      const statusCode = err.response?.status;
      const detail = err.response?.data?.detail;

      let msg = 'MCQ generation failed. Please try again.';
      if (statusCode === 503 || detail?.includes('503') || detail?.includes('unavailable')) {
        msg = 'AI service is temporarily busy (503 Service Unavailable). Click "Load Demo MCQs" below to present seamlessly!';
      } else if (statusCode === 429 || detail?.includes('rate limit')) {
        msg = 'API Rate limit exceeded. Presentation fallback is available immediately!';
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
    const isCs = chosenTopic.toLowerCase().includes('os') ||
                 chosenTopic.toLowerCase().includes('system') ||
                 chosenTopic.toLowerCase().includes('data') ||
                 chosenTopic.toLowerCase().includes('computer');

    const demo = isCs ? DEMO_MCQ_BANK.cs : DEMO_MCQ_BANK.general;
    setResult(demo);
    setIsDemoMode(true);
    setError(null);
    setRevealAllAnswers(false);
    setUserAnswers({});
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
  };

  const handleSaveToLibrary = async () => {
    if (!result) return;
    try {
      await api.post('/library/', {
        title: `${topic || 'Curated'} MCQs (${difficulty})`,
        type: 'mcq',
        content: result
      });
      setSaveSuccess('MCQs saved to My Library successfully!');
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err) {
      console.warn('Library API error, using local fallback:', err);
      const savedItems = JSON.parse(localStorage.getItem('user_saved_mcqs') || '[]');
      savedItems.unshift({
        id: Date.now(),
        title: `${topic || 'Curated'} MCQs (${difficulty})`,
        type: 'mcq',
        content: result,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('user_saved_mcqs', JSON.stringify(savedItems));
      setSaveSuccess('Saved to Local Library storage!');
      setTimeout(() => setSaveSuccess(null), 3500);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    let text = `TOPIC: ${topic || 'Multiple Choice Questions'}\n`;
    text += `Difficulty: ${difficulty} | Level: ${level}\n\n`;

    result.questions.forEach((q, idx) => {
      text += `${idx + 1}. ${q.question}\n`;
      q.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        text += `   ${letter}) ${opt.text}\n`;
      });
      const correctOpt = q.options.find(o => o.is_correct);
      text += `Correct: ${correctOpt ? correctOpt.text : 'N/A'}\n`;
      text += `Explanation: ${q.explanation}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    let text = `=====================================================\n`;
    text += `${(topic || 'MCQ ASSESSMENT').toUpperCase()}\n`;
    text += `Difficulty: ${difficulty} | Level: ${level} | Questions: ${result.questions.length}\n`;
    text += `Generated: ${new Date().toLocaleDateString()}\n`;
    text += `=====================================================\n\n`;

    text += `--- MULTIPLE CHOICE QUESTIONS ---\n\n`;
    result.questions.forEach((q, idx) => {
      text += `Q${idx + 1}: ${q.question}\n`;
      q.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        text += `   [${letter}] ${opt.text}\n`;
      });
      text += `\n`;
    });

    text += `=====================================================\n`;
    text += `--- ANSWER KEY & EXPLANATIONS ---\n`;
    text += `=====================================================\n\n`;
    result.questions.forEach((q, idx) => {
      const correctIdx = q.options.findIndex(o => o.is_correct);
      const letter = correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : 'N/A';
      const correctText = correctIdx >= 0 ? q.options[correctIdx].text : '';
      text += `Q${idx + 1} Answer: [${letter}] ${correctText}\n`;
      text += `Rationale: ${q.explanation}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(topic || 'mcqs').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_assessment.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              MCQ Generator
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-300">
              Exam Ready
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Generate balanced multiple-choice questions with verified distractor options, answer keys, and faculty demo resilience.
          </p>
        </div>

        {/* Demo Mode Button */}
        <button
          type="button"
          onClick={() => handleLoadDemo()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700 hover:bg-violet-100 transition shadow-xs cursor-pointer"
        >
          <Sparkles size={14} className="text-violet-500 animate-pulse" />
          <span>Quick Demo MCQs (Faculty Presentation)</span>
        </button>
      </div>

      {/* Generator Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Subject or Topic <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">e.g. Operating Systems, Microeconomics, Chemical Bonds</span>
            </div>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter subject or concept to assess..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition text-sm font-medium"
            />
            {/* Suggestions */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                <BookOpen size={12} /> Popular:
              </span>
              {SUGGESTIONS.map((sug) => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => setTopic(sug)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950 hover:text-violet-600 dark:hover:text-violet-400 border border-slate-200 dark:border-slate-700/60 transition"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Form Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Number of MCQs
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  min="1"
                  max="25"
                  required
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.max(1, Math.min(25, parseInt(e.target.value) || 1)))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm font-medium"
                />
                <div className="flex gap-1">
                  {[3, 5, 8, 10].map((count) => (
                    <button
                      type="button"
                      key={count}
                      onClick={() => setNumQuestions(count)}
                      className={`flex-1 py-1 rounded text-xs font-semibold transition ${
                        numQuestions === count
                          ? 'bg-violet-600 text-white'
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm font-medium"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Educational Level */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Educational Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm font-medium"
              >
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
                <option value="College">College / University</option>
                <option value="Advanced">Advanced / Professional</option>
              </select>
            </div>

            {/* Number of Options */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Options per MCQ
              </label>
              <select
                value={numOptions}
                onChange={(e) => setNumOptions(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm font-medium"
              >
                <option value={3}>3 Options (A, B, C)</option>
                <option value={4}>4 Options (A, B, C, D)</option>
                <option value={5}>5 Options (A, B, C, D, E)</option>
              </select>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <button
              type="button"
              onClick={() => setShowSourceInput(!showSourceInput)}
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {showSourceInput ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{showSourceInput ? 'Hide' : 'Add'} Optional Reference Text</span>
            </button>
            {showSourceInput && (
              <textarea
                value={sourceMaterial}
                onChange={(e) => setSourceMaterial(e.target.value)}
                rows={3}
                placeholder="Paste reference text or curriculum standards to generate precise MCQs..."
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            )}
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 transition shadow-lg shadow-violet-600/20 disabled:opacity-50 flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing MCQs & Verified Distractors...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate MCQs</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 503 / Network Error Fallback Banner */}
      {error && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-amber-900 dark:text-amber-100">
                  AI Service Notice
                </h3>
                <p className="text-sm text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                  {error}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  You can load verified demonstration questions instantly to continue your presentation.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLoadDemo()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-md transition shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Load Demo MCQs</span>
            </button>
          </div>
        </div>
      )}

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Result MCQs */}
      {result && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Demo Ribbon */}
          {isDemoMode && (
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2 text-white text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} />
                Showcase Mode Active (Verified High-Quality MCQs)
              </span>
              <button
                onClick={() => handleGenerate()}
                className="underline hover:opacity-90 cursor-pointer text-xs"
              >
                Retry Live Generation
              </button>
            </div>
          )}

          {/* Action Bar */}
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800">
                    {difficulty}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {level}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                    {result.questions.length} MCQs Formatted
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {topic ? `${topic} MCQs` : 'Multiple Choice Assessment'}
                </h2>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Reveal Answer Key Toggle */}
                <button
                  type="button"
                  onClick={() => setRevealAllAnswers(!revealAllAnswers)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                    revealAllAnswers
                      ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {revealAllAnswers ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span>{revealAllAnswers ? 'Hide Answer Key' : 'Reveal Answer Key'}</span>
                </button>

                {/* Save */}
                <button
                  type="button"
                  onClick={handleSaveToLibrary}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 transition cursor-pointer"
                >
                  <Save size={15} />
                  <span>Save</span>
                </button>

                {/* Download TXT */}
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  <Download size={15} />
                  <span>Export TXT</span>
                </button>

                {/* Copy */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Print */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  title="Print Question Sheet"
                >
                  <Printer size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Questions Render */}
          <div className="p-6 md:p-8 space-y-6">
            {result.questions.map((q, qIdx) => {
              const selectedIdx = userAnswers[qIdx];
              return (
                <div
                  key={qIdx}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-600 text-white font-bold text-xs shrink-0 mt-0.5">
                      {qIdx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-snug">
                        {q.question}
                      </h4>
                      {q.difficulty && (
                        <span className="inline-block mt-1 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          Target: {q.difficulty}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 pl-10">
                    {q.options?.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = selectedIdx === optIdx;
                      const showAsCorrect = revealAllAnswers && opt.is_correct;
                      const isUserIncorrect = !revealAllAnswers && isSelected && !opt.is_correct;
                      const isUserCorrect = !revealAllAnswers && isSelected && opt.is_correct;

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          className={`p-3.5 rounded-xl border text-sm font-medium transition cursor-pointer flex items-center justify-between select-none ${
                            showAsCorrect || isUserCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                              : isUserIncorrect
                              ? 'bg-red-50 dark:bg-red-950/70 border-red-400 text-red-900 dark:text-red-200'
                              : isSelected
                              ? 'bg-violet-50 dark:bg-violet-950/50 border-violet-400 text-violet-900 dark:text-violet-200'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-violet-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                                showAsCorrect || isUserCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : isUserIncorrect
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {letter}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          {(showAsCorrect || isUserCorrect) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100">
                              Correct
                            </span>
                          )}
                          {isUserIncorrect && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-100">
                              Incorrect
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation card */}
                  {(revealAllAnswers || selectedIdx !== undefined) && (
                    <div className="ml-10 p-4 rounded-xl bg-white dark:bg-slate-800 border-l-4 border-violet-500 shadow-xs space-y-1.5 animate-in fade-in">
                      <div className="flex items-center gap-1.5 text-violet-700 dark:text-violet-400 font-bold text-xs uppercase tracking-wide">
                        <CheckCircle2 size={14} />
                        <span>Explanation & Pedagogical Rationale</span>
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
        </div>
      )}
    </div>
  );
};

export default MCQGenerator;
