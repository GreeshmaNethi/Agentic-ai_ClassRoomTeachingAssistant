import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Sparkles,
  Download,
  Copy,
  Save,
  Check,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  Printer,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Target,
  Clock,
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface AssignmentTask {
  title: string;
  description: string;
  expected_outcome: string;
}

interface AssignmentResult {
  title: string;
  instructions: string;
  tasks: AssignmentTask[];
}

// Fallback demo assignments for presentation guarantee
const DEMO_ASSIGNMENTS: Record<string, AssignmentResult> = {
  project: {
    title: 'Distributed Systems & Microservices Architecture Project',
    instructions: 'Complete the following architectural design and prototyping tasks. Submit a GitHub repository containing your implementation code along with a comprehensive technical PDF report. Adhere to academic integrity standards.',
    tasks: [
      {
        title: 'Task 1: System Architecture & Data Flow Design',
        description: 'Design a high-level system diagram illustrating a scalable distributed microservices platform. Detail the API Gateway, Authentication Service, Message Broker (e.g. Kafka or RabbitMQ), and database persistence tiers. Include fault tolerance and circuit breaker patterns.',
        expected_outcome: 'A clear C4 or UML architecture diagram accompanied by a 2-page design rationale evaluating CAP theorem trade-offs.'
      },
      {
        title: 'Task 2: RESTful API & Service Implementation',
        description: 'Implement two interacting microservices using Python (FastAPI) or TypeScript (Express/NestJS). Ensure data validation via Pydantic/Zod schemas, structured logging, and robust HTTP error code handling.',
        expected_outcome: 'Production-ready source code repository with comprehensive automated unit tests and Docker Compose containerization script.'
      },
      {
        title: 'Task 3: Load Testing & Performance Benchmarking',
        description: 'Execute stress testing using Locust or k6 simulating up to 1,000 concurrent requests. Identify performance bottlenecks, latency percentiles (p95, p99), and propose database indexing optimizations.',
        expected_outcome: 'Benchmark results summary table with latency graphs, profiling data, and mitigation strategies for identified bottlenecks.'
      }
    ]
  },
  lab: {
    title: 'Cellular Bioenergetics & Enzyme Kinetics Lab Report',
    instructions: 'Analyze the experimental rate of enzymatic reactions under varying pH and substrate concentrations. Prepare a standard scientific lab report adhering to the IMRAD format (Introduction, Methods, Results, and Discussion).',
    tasks: [
      {
        title: 'Task 1: Michaelis-Menten Kinetics Modeling',
        description: 'Using the provided spectrophotometric absorbance dataset, plot initial velocity (V0) versus substrate concentration [S]. Generate a Lineweaver-Burk double-reciprocal plot to determine Vmax and Km parameters.',
        expected_outcome: 'Calculated Vmax and Km values with Lineweaver-Burk linear regression equations and coefficient of determination (R²).'
      },
      {
        title: 'Task 2: Environmental Factors & Denaturation Analysis',
        description: 'Examine reaction rates across pH ranges (4.0 to 9.0) and temperatures (20°C to 75°C). Explain the molecular mechanisms leading to optimal catalytic efficiency versus active site denaturation.',
        expected_outcome: 'A 500-word biochemical discussion detailing non-covalent bond disruption and enzyme stability profiles.'
      },
      {
        title: 'Task 3: Real-World Clinical or Industrial Application',
        description: 'Synthesize how the investigated enzymatic mechanism applies to pharmaceutical enzyme inhibition (competitive vs non-competitive drug design) or biofuel production.',
        expected_outcome: 'A 1-page synthesis connecting experimental enzyme kinetics to a contemporary biomedical application.'
      }
    ]
  }
};

const SUGGESTED_TOPICS = [
  'Distributed Systems & Microservices Project',
  'Enzyme Kinetics & Metabolic Pathways Lab',
  'Macroeconomics: Monetary Policy Case Study',
  'Machine Learning: Neural Networks from Scratch',
  'Climate Change & Renewable Energy Transition'
];

const AssignmentGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [assignmentType, setAssignmentType] = useState('Project');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numTasks, setNumTasks] = useState<number>(3);
  const [learningObjectives, setLearningObjectives] = useState('');
  const [level, setLevel] = useState('College');
  const [instructions, setInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssignmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a subject or topic for the assignment.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsDemoMode(false);

    try {
      const response = await api.post('/generate/assignment', {
        topic: topic.trim(),
        assignment_type: assignmentType,
        difficulty,
        num_tasks: Number(numTasks),
        learning_objectives: learningObjectives.trim() || `Master core concepts and practical application of ${topic.trim()}`,
        educational_level: level,
        instructions: instructions.trim() || undefined
      });

      if (response.data && response.data.tasks && response.data.tasks.length > 0) {
        setResult(response.data);
      } else {
        throw new Error('AI agent returned empty tasks.');
      }
    } catch (err: any) {
      console.error('Assignment generation error:', err);
      const statusCode = err.response?.status;
      const detail = err.response?.data?.detail;

      let msg = 'Failed to generate assignment.';
      if (statusCode === 503 || detail?.includes('503') || detail?.includes('unavailable')) {
        msg = 'AI service is busy (503 Service Unavailable). Click "Load Demo Assignment" below to present instantly!';
      } else if (statusCode === 429 || detail?.includes('rate limit')) {
        msg = 'API Rate limit reached. You can immediately load the pre-built Assignment Demo to keep your presentation moving smoothly!';
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
    const isLab = chosenTopic.toLowerCase().includes('bio') ||
                  chosenTopic.toLowerCase().includes('chem') ||
                  chosenTopic.toLowerCase().includes('lab') ||
                  assignmentType === 'Lab Report';

    const demo = isLab ? DEMO_ASSIGNMENTS.lab : DEMO_ASSIGNMENTS.project;
    setResult({
      ...demo,
      title: chosenTopic ? `${chosenTopic} ${assignmentType}` : demo.title
    });
    setIsDemoMode(true);
    setError(null);
  };

  const handleSaveToLibrary = async () => {
    if (!result) return;
    try {
      await api.post('/library/', {
        title: result.title || `${topic} Assignment`,
        type: 'assignment',
        content: result
      });
      setSaveSuccess('Assignment saved to My Library successfully!');
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err) {
      console.warn('Library API error, using local fallback:', err);
      const saved = JSON.parse(localStorage.getItem('user_saved_assignments') || '[]');
      saved.unshift({
        id: Date.now(),
        title: result.title,
        type: 'assignment',
        content: result,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('user_saved_assignments', JSON.stringify(saved));
      setSaveSuccess('Saved to Local Library storage!');
      setTimeout(() => setSaveSuccess(null), 3500);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    let text = `=====================================================\n`;
    text += `${result.title.toUpperCase()}\n`;
    text += `Assignment Type: ${assignmentType} | Level: ${level} | Difficulty: ${difficulty}\n`;
    text += `=====================================================\n\n`;
    text += `INSTRUCTIONS:\n${result.instructions}\n\n`;
    text += `TASKS & DELIVERABLES:\n`;

    result.tasks.forEach((t, i) => {
      text += `\n[Task ${i + 1}] ${t.title}\n`;
      text += `Description: ${t.description}\n`;
      text += `Expected Deliverable: ${t.expected_outcome}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    let text = `=====================================================\n`;
    text += `${result.title.toUpperCase()}\n`;
    text += `Type: ${assignmentType} | Difficulty: ${difficulty} | Level: ${level}\n`;
    text += `Date of Issue: ${new Date().toLocaleDateString()}\n`;
    text += `=====================================================\n\n`;

    text += `COURSE INSTRUCTIONS & GUIDELINES:\n`;
    text += `${result.instructions}\n\n`;
    text += `=====================================================\n`;
    text += `ASSIGNMENT TASKS\n`;
    text += `=====================================================\n\n`;

    result.tasks.forEach((t, i) => {
      text += `TASK ${i + 1}: ${t.title.toUpperCase()}\n`;
      text += `Details:\n${t.description}\n\n`;
      text += `Expected Submission / Outcome:\n--> ${t.expected_outcome}\n\n`;
      text += `-----------------------------------------------------\n\n`;
    });

    text += `\nGRADING RUBRIC GUIDELINES:\n`;
    text += `- Technical Correctness & Depth: 40%\n`;
    text += `- Methodology & Implementation: 30%\n`;
    text += `- Clarity of Report & Deliverable: 20%\n`;
    text += `- Academic Rigor & References: 10%\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(result.title || 'assignment').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
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
              Assignment Generator
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              Instructor Portal
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Generate classroom-ready essays, problem sets, projects, and lab assignments with rubrics and deliverables.
          </p>
        </div>

        {/* Demo Button for Presentation Guarantee */}
        <button
          type="button"
          onClick={() => handleLoadDemo()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 hover:bg-blue-100 transition shadow-xs"
        >
          <Sparkles size={14} className="text-blue-500 animate-pulse" />
          <span>Quick Demo Assignment (Faculty Presentation)</span>
        </button>
      </div>

      {/* Generator Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Assignment Topic <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">e.g. Distributed Systems Architecture, Enzyme Kinetics</span>
            </div>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter subject or curriculum topic..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-sm font-medium"
            />
            {/* Quick Suggestions */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                <BookOpen size={12} /> Templates:
              </span>
              {SUGGESTED_TOPICS.map((top) => (
                <button
                  type="button"
                  key={top}
                  onClick={() => setTopic(top)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700/60 transition"
                >
                  {top}
                </button>
              ))}
            </div>
          </div>

          {/* Form Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Assignment Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Assignment Type
              </label>
              <select
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium"
              >
                <option value="Project">Project / Capstone</option>
                <option value="Problem Set">Problem Set</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Essay">Academic Essay</option>
                <option value="Case Study">Case Study Analysis</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium"
              >
                <option value="Easy">Easy (Introductory)</option>
                <option value="Medium">Medium (Standard)</option>
                <option value="Hard">Hard (Advanced / Rigorous)</option>
              </select>
            </div>

            {/* Number of Tasks */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Number of Tasks (2-6)
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  min="2"
                  max="6"
                  required
                  value={numTasks}
                  onChange={(e) => setNumTasks(Math.max(2, Math.min(6, parseInt(e.target.value) || 2)))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium"
                />
                <div className="flex gap-1">
                  {[2, 3, 4, 5].map((cnt) => (
                    <button
                      type="button"
                      key={cnt}
                      onClick={() => setNumTasks(cnt)}
                      className={`flex-1 py-1 rounded text-xs font-semibold transition ${
                        numTasks === cnt
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Educational Level */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Educational Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium"
              >
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
                <option value="College">College / Undergraduate</option>
                <option value="Graduate">Graduate / Masters</option>
              </select>
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Specific Learning Objectives
            </label>
            <textarea
              value={learningObjectives}
              onChange={(e) => setLearningObjectives(e.target.value)}
              rows={2}
              placeholder="e.g. Students will implement scalable microservices, apply CAP theorem principles, and benchmark latency percentiles under load..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Advanced Instructions Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{showAdvanced ? 'Hide' : 'Add'} Submission Format & Classroom Guidelines</span>
            </button>
            {showAdvanced && (
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                placeholder="e.g. Include PDF submission guidelines, plagiarism policy, preferred coding languages, or citation style..."
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            )}
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Academic Assignment Structure...</span>
                </>
              ) : (
                <>
                  <FileText size={18} />
                  <span>Generate Curriculum Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 503 / Offline Fallback Banner */}
      {error && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-amber-900 dark:text-amber-100">
                  AI Generation Service Notice
                </h3>
                <p className="text-sm text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                  {error}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Presentation safeguard: Click "Load Demo Assignment" to showcase a structured academic assignment immediately!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLoadDemo()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Load Demo Assignment</span>
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

      {/* Formatted Assignment Result */}
      {result && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Demo Ribbon */}
          {isDemoMode && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-white text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} />
                Presentation Showcase Mode Active (Faculty-Ready Assignment)
              </span>
              <button
                onClick={() => handleGenerate()}
                className="underline hover:opacity-90 cursor-pointer text-xs"
              >
                Retry Live Generation
              </button>
            </div>
          )}

          {/* Assignment Header */}
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                    {assignmentType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {level}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                    {difficulty} Difficulty
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
                    {result.tasks.length} Structured Tasks
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {result.title}
                </h2>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Save */}
                <button
                  type="button"
                  onClick={handleSaveToLibrary}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition"
                >
                  <Save size={15} />
                  <span>Save</span>
                </button>

                {/* Download TXT */}
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition"
                >
                  <Download size={15} />
                  <span>Export TXT</span>
                </button>

                {/* Copy */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition"
                >
                  {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Print */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
                  title="Print Assignment Handout"
                >
                  <Printer size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* General Instructions Card */}
            {result.instructions && (
              <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold text-sm">
                  <ClipboardList size={18} className="text-blue-600" />
                  <span>Course Instructions & Submission Guidelines</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {result.instructions}
                </p>
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target size={18} className="text-blue-600" />
                <span>Assignment Tasks & Milestones</span>
              </h3>

              {result.tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-blue-200 transition space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-sm shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {task.title}
                      </h4>
                      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  {/* Expected Outcome & Submission Deliverable */}
                  <div className="ml-11 p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-emerald-200 dark:border-emerald-800/60 shadow-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                      <FileCheck size={14} className="text-emerald-600" />
                      <span>Required Deliverable / Expected Outcome</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {task.expected_outcome}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rubric Overview */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-3">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <GraduationCap size={16} className="text-indigo-600" />
                <span>Suggested Evaluation & Grading Rubric</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Technical Depth (40%)</span>
                  <span className="text-slate-500 dark:text-slate-400">Core accuracy, theoretical soundness, and task fulfillment.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Methodology (30%)</span>
                  <span className="text-slate-500 dark:text-slate-400">Design quality, modularity, algorithmic efficiency.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Deliverable Clarity (20%)</span>
                  <span className="text-slate-500 dark:text-slate-400">Clear documentation, formatting, diagrams, and clean code.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Academic Rigor (10%)</span>
                  <span className="text-slate-500 dark:text-slate-400">References, error analysis, and edge case evaluation.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentGenerator;
