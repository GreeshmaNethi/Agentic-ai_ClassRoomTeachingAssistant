import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  Lightbulb, 
  Sparkles, 
  Copy, 
  Check, 
  Save, 
  Download, 
  Loader2, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  CheckSquare, 
  GraduationCap, 
  Compass
} from 'lucide-react';

interface ConceptResult {
  concept: string;
  explanation: string;
  style?: string;
  level?: string;
  includeExample?: boolean;
  takeaways?: string[];
  example?: string;
  timestamp?: string;
  isDemo?: boolean;
}

const PRESET_CONCEPTS = [
  { label: 'Quantum Entanglement', name: 'Quantum Entanglement & Spooky Action' },
  { label: 'Recursion in Code', name: 'Recursion and Call Stack in Programming' },
  { label: 'ATP Synthesis', name: 'Mitochondrial ATP Synthase & Cellular Respiration' },
  { label: 'Supply & Demand', name: 'Economic Supply, Demand, and Price Equilibrium' },
];

const DEMO_CONCEPTS: Record<string, ConceptResult> = {
  simple: {
    concept: 'Quantum Entanglement',
    style: 'Simple',
    level: 'High School',
    includeExample: true,
    isDemo: true,
    explanation: `Quantum entanglement is a mind-bending principle of physics where two or more particles become intimately connected in such a way that the quantum state of each particle cannot be described independently—no matter how many light-years separate them.

When you observe or measure particle A (for example, determining whether its spin is 'up' or 'down'), particle B instantaneously assumes the opposite corresponding state, faster than the speed of light could ever travel between them. Albert Einstein famously found this so counter-intuitive that he called it 'spooky action at a distance' (spukhafte Fernwirkung).

In modern science, entanglement is not magic—it is the foundational bedrock of quantum cryptography, unhackable quantum key distribution, and ultra-fast quantum computers.`,
    example: `Imagine you have a pair of custom shoes in two identical, sealed shoeboxes. One box is taken to Tokyo, and the other stays with you in New York. 
Before opening either box, neither shoe is determined as strictly 'left' or 'right'—they exist in an undecided quantum superposition. 
The exact millisecond you peel the tape off your box in New York and see a Left shoe, you know with 100% certainty that the box in Tokyo contains the Right shoe—instantly, without having to send a radio signal or call anyone in Japan!`,
    takeaways: [
      'Entangled particles share a unified quantum state regardless of distance.',
      'Measuring one particle collapses the probability wave of both simultaneously.',
      'It does not violate relativity because no classical message or data can travel faster than light.',
      'Powers emerging technologies like quantum key distribution (QKD) and supercomputing.'
    ]
  },
  stepByStep: {
    concept: 'Recursion & The Call Stack',
    style: 'Step-by-Step',
    level: 'College',
    includeExample: true,
    isDemo: true,
    explanation: `Recursion is a computational and mathematical problem-solving technique where a function solves a complex problem by calling smaller instances of itself until it reaches a trivial baseline condition.

The execution mechanics operate in a strict four-phase lifecycle:

Step 1: Establishing the Base Case
Every recursive algorithm must define a termination guard. Without a base case, the function will invoke itself indefinitely until memory is exhausted (Stack Overflow error).

Step 2: The Recursive Step (Problem Decomposition)
The function divides the input into a smaller sub-problem, moving progressively closer to the base case (e.g., n * factorial(n - 1)).

Step 3: Call Stack Stacking (Winding Phase)
Each recursive call pauses the current execution frame and pushes its local variables, parameters, and return address onto the system Call Stack in memory.

Step 4: Stack Unwinding & Solution Assembly
Once the base case is satisfied, each waiting stack frame resolves its computed return value in Last-In-First-Out (LIFO) order, assembling the final output.`,
    example: `Think of Russian Matryoshka nesting dolls:
To find the golden coin placed inside the smallest doll, you open doll #1. Inside is doll #2 (a smaller identical version). You keep opening smaller dolls (recursive calls) until you reach the solid, unopenable wooden baby doll at the core (Base Case). 
You grab the coin and then seal each doll back together in reverse order as you pack them up (Stack Unwinding).`,
    takeaways: [
      'A base case is mandatory to prevent infinite recursion and stack overflows.',
      'The system call stack manages execution memory using LIFO (Last-In-First-Out).',
      'Recursion produces elegant code for tree traversals, graphs, and divide-and-conquer algorithms (like QuickSort).',
      'Can be converted to iterative loops or optimized via Tail Call Optimization (TCO) and memoization.'
    ]
  }
};

const ConceptExplainer: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [style, setStyle] = useState<'Simple' | 'Step-by-Step' | 'Academic'>('Simple');
  const [level, setLevel] = useState('High School');
  const [includeExample, setIncludeExample] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConceptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemoFallbackActive, setIsDemoFallbackActive] = useState(false);

  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const parseGeneratedExplanation = (text: string, conceptName: string): ConceptResult => {
    let explanation = text;
    let example: string | undefined = undefined;
    let takeaways: string[] = [];

    const exampleMatch = text.match(/(?:Real-World Example|Example|Analogy):?\s*([\s\S]*?)(?:Key Takeaways|Summary|$)/i);
    if (exampleMatch && exampleMatch[1].trim()) {
      example = exampleMatch[1].trim();
    }

    const takeawaysMatch = text.match(/(?:Key Takeaways|Summary|Core Points):?\s*([\s\S]*?)$/i);
    if (takeawaysMatch && takeawaysMatch[1].trim()) {
      takeaways = takeawaysMatch[1]
        .split('\n')
        .map(line => line.replace(/^[-*•\d.]\s*/, '').trim())
        .filter(line => line.length > 5);
    }

    if (takeaways.length === 0) {
      takeaways = [
        `Core mechanism of ${conceptName} explained at ${level} comprehension level.`,
        `Focuses on ${style.toLowerCase()} conceptual clarity and intuitive foundations.`,
        'Applicable for classroom discussion, quiz preparation, and conceptual revision.'
      ];
    }

    return {
      concept: conceptName,
      explanation,
      style,
      level,
      includeExample,
      example,
      takeaways,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDemo: false
    };
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!concept.trim()) return;

    setLoading(true);
    setError(null);
    setIsDemoFallbackActive(false);
    setSaveStatus('idle');

    try {
      const response = await api.post('/generate/concept', {
        topic: concept.trim(),
        style,
        educational_level: level,
        include_example: includeExample
      });

      if (response.data && response.data.explanation) {
        const parsed = parseGeneratedExplanation(response.data.explanation, response.data.concept || concept.trim());
        setResult(parsed);
      } else {
        throw new Error('Incomplete response received from concept engine.');
      }
    } catch (err: any) {
      console.warn('API concept explanation failed, enabling demo fallback:', err);
      const statusCode = err.response?.status;
      const detail = err.response?.data?.detail;

      if (statusCode === 503 || (detail && detail.includes('503')) || !err.response) {
        setError('The AI service is temporarily unavailable or busy (503). You can load the guaranteed Faculty Presentation Demo below.');
      } else {
        setError(detail || 'Generation failed. You can retry or switch to presentation demo mode.');
      }
      setIsDemoFallbackActive(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = (key?: string) => {
    setError(null);
    setSaveStatus('idle');
    const demo = (style === 'Step-by-Step' || key === 'stepByStep') 
      ? DEMO_CONCEPTS.stepByStep 
      : DEMO_CONCEPTS.simple;

    const activeConceptName = concept.trim() || demo.concept;

    setResult({
      ...demo,
      concept: activeConceptName,
      style,
      level,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDemo: true
    });
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      let fullText = `CONCEPT EXPLANATION: ${result.concept}\n`
        + `Style: ${result.style} | Level: ${result.level}\n\n`
        + `EXPLANATION:\n${result.explanation}\n\n`;

      if (result.example) {
        fullText += `REAL-WORLD ANALOGY / EXAMPLE:\n${result.example}\n\n`;
      }

      if (result.takeaways && result.takeaways.length > 0) {
        fullText += `KEY TAKEAWAYS:\n` + result.takeaways.map(t => `• ${t}`).join('\n') + `\n`;
      }

      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!result) return;
    setSaveStatus('saving');
    try {
      await api.post('/library/', {
        title: `Concept: ${result.concept}`,
        type: 'concept',
        content: {
          concept: result.concept,
          explanation: result.explanation,
          example: result.example,
          takeaways: result.takeaways,
          style: result.style,
          level: result.level,
          savedAt: new Date().toISOString()
        }
      });
      setSaveStatus('saved');
      setSaveMessage('Saved to your Library successfully!');
      setTimeout(() => setSaveStatus('idle'), 3500);
    } catch (err: any) {
      console.error('Failed to save to library:', err);
      setSaveStatus('error');
      setSaveMessage('Failed to save to library. Please check your connection.');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  const handleExportTxt = () => {
    if (!result) return;
    const content = `========================================================\n`
      + `AI CONCEPT DECONSTRUCTOR: ${result.concept.toUpperCase()}\n`
      + `========================================================\n`
      + `Explanation Style: ${result.style || style}\n`
      + `Target Audience:   ${result.level || level}\n`
      + `Export Date:       ${new Date().toLocaleString()}\n`
      + `========================================================\n\n`
      + `[CORE EXPLANATION]\n`
      + `${result.explanation}\n\n`
      + (result.example ? `[REAL-WORLD ANALOGY & EXAMPLE]\n${result.example}\n\n` : '')
      + (result.takeaways && result.takeaways.length > 0 ? `[KEY TAKEAWAYS]\n${result.takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n` : '')
      + `--------------------------------------------------------\n`
      + `Generated by AI Classroom Teaching Assistant\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedName = (result.concept || 'concept_explanation').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 35);
    a.download = `${sanitizedName}_explained.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <Lightbulb size={13} className="text-indigo-600" />
            <span>Pedagogical Breakdown Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Concept Explainer</h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Demystify complex academic, scientific, or abstract concepts with tailored mental models, intuitive analogies, and pedagogical breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleLoadDemo()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
            title="Load instant pre-configured presentation data"
          >
            <Sparkles size={14} className="text-indigo-600" />
            <span>Try Demo Concept</span>
          </button>
        </div>
      </div>

      {/* Input Configuration Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-7">
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Quick preset concepts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Popular Academic Concepts
              </label>
              <span className="text-xs text-slate-400">Click to fill</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_CONCEPTS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setConcept(preset.name)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition text-left ${
                    concept === preset.name
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-medium'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Concept Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Concept to Explain <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g. Quantum Superposition, Recursion, Game Theory, or Cellular Mitosis..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 placeholder-slate-400 transition"
            />
          </div>

          {/* Form Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Explanation Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Compass size={14} className="text-indigo-600" />
                <span>Explanation Style</span>
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              >
                <option value="Simple">Simple (ELI5 / Intuitive Analogy)</option>
                <option value="Step-by-Step">Step-by-Step (Sequential Breakdown)</option>
                <option value="Academic">Academic (Rigorous Pedagogical)</option>
              </select>
            </div>

            {/* Educational Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-indigo-600" />
                <span>Target Educational Level</span>
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              >
                <option value="Middle School">Middle School (Grades 6–8)</option>
                <option value="High School">High School (Grades 9–12)</option>
                <option value="College">College / Undergraduate</option>
                <option value="Advanced">Advanced / Postgraduate</option>
              </select>
            </div>

            {/* Checkbox: Real World Example */}
            <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={includeExample}
                  onChange={(e) => setIncludeExample(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700">
                  Include Real-World Analogy & Example
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !concept.trim()}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm hover:shadow transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Deconstructing Concept...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Explain Concept</span>
                </>
              )}
            </button>

            {concept && (
              <button
                type="button"
                onClick={() => {
                  setConcept('');
                  setResult(null);
                  setError(null);
                }}
                className="w-full sm:w-auto px-4 py-3 text-slate-600 hover:text-slate-800 text-sm font-medium border border-slate-200 hover:bg-slate-50 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </form>

        {/* 503 Error Banner with Presentation Demo Button */}
        {error && (
          <div className="mt-5 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-semibold text-amber-950">AI Service Notice</p>
                <p className="text-amber-800 mt-0.5">{error}</p>
              </div>
            </div>
            {isDemoFallbackActive && (
              <button
                type="button"
                onClick={() => handleLoadDemo()}
                className="shrink-0 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Try Demo Concept</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Styled Explanation Cards */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Bar for Result */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {result.level || level}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {result.style || style} Style
                </span>
                {result.isDemo && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Faculty Demo Mode
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                {result.concept}
              </h2>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition"
                title="Copy entire breakdown"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition"
                title="Download formatted text document"
              >
                <Download size={14} className="text-slate-500" />
                <span>Export TXT</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToLibrary}
                disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition shadow-2xs ${
                  saveStatus === 'saved'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : saveStatus === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-300'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {saveStatus === 'saving' ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Saved in Library</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save to Library</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {saveMessage && (
            <div className={`p-3 rounded-xl text-xs font-medium border flex items-center justify-between ${
              saveStatus === 'saved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <span>{saveMessage}</span>
              <span className="cursor-pointer font-bold ml-2" onClick={() => setSaveMessage('')}>&times;</span>
            </div>
          )}

          {/* Grid of Explanation Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Explanation Card - 2 Columns */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-7 space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm border-b border-slate-100 pb-3">
                <BookOpen size={18} className="text-indigo-600" />
                <span>Foundational Explanation</span>
              </div>
              <div className="text-slate-800 leading-relaxed text-sm md:text-base space-y-3 whitespace-pre-wrap">
                {result.explanation}
              </div>

              {/* Real World Example Highlight Card */}
              {result.example && (
                <div className="mt-6 p-5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                    <Lightbulb size={16} className="text-amber-600" />
                    <span>Real-World Analogy & Mental Model</span>
                  </div>
                  <p className="text-sm leading-relaxed text-amber-900/90">
                    {result.example}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar Cards - 1 Column */}
            <div className="space-y-6">
              {/* Key Takeaways Card */}
              {result.takeaways && result.takeaways.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
                    <CheckSquare size={16} className="text-emerald-600" />
                    <span>Key Takeaways for Students</span>
                  </div>
                  <ul className="space-y-2.5">
                    {result.takeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] mt-0.5 border border-emerald-200">
                          {idx + 1}
                        </span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Classroom Teaching Tip Card */}
              <div className="bg-gradient-to-br from-indigo-50/90 to-purple-50/90 rounded-2xl border border-indigo-100 p-5 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-sm">
                  <GraduationCap size={16} className="text-indigo-600" />
                  <span>Instructor Tip</span>
                </div>
                <p className="text-indigo-800 leading-relaxed">
                  Use the intuitive analogy as an entry hook during the first 5 minutes of class, followed by the formal definition to cement conceptual retention.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConceptExplainer;
