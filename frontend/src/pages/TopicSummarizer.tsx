import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  FileText, 
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
  Clock, 
  AlignLeft, 
  ListOrdered,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

interface SummaryResult {
  title: string;
  content: string;
  source?: string;
  length?: string;
  format?: string;
  level?: string;
  timestamp?: string;
  isDemo?: boolean;
}

const PRESET_TOPICS = [
  { label: 'Photosynthesis', topic: 'Photosynthesis and Energy Conversion in Plants' },
  { label: 'Quantum Computing', topic: 'Quantum Computing Principles: Superposition and Qubits' },
  { label: 'French Revolution', topic: 'Causes and Consequences of the French Revolution (1789-1799)' },
  { label: 'Neural Networks', topic: 'Deep Learning and Artificial Neural Networks Architecture' },
];

const DEMO_SUMMARIES: Record<string, SummaryResult> = {
  default: {
    title: 'Executive Summary: Photosynthesis & Energy Dynamics in Plants',
    length: 'Medium',
    format: 'Paragraphs',
    level: 'High School',
    isDemo: true,
    content: `Photosynthesis is the fundamental biological process by which green plants, algae, and certain bacteria transform light energy—primarily from the sun—into chemical energy stored in glucose molecules. This biochemical pathway sustains nearly all aerobic life on Earth by generating oxygen as a vital byproduct while simultaneously sequestering atmospheric carbon dioxide.

The overall chemical equation governing this transformation is:
6CO₂ + 6H₂O + Solar Photons ➔ C₆H₁₂O₆ (Glucose) + 6O₂

The mechanism takes place inside specialized cellular organelles called chloroplasts and unfolds in two synchronized phases:

1. The Light-Dependent Reactions (Thylakoid Membrane):
Chlorophyll pigments absorb specific wavelengths of solar radiation, exciting electrons to higher energy states. Water molecules are enzymatically split (photolysis), liberating free oxygen gas, while the transferred electron flow drives the synthesis of ATP (adenosine triphosphate) and NADPH (nicotinamide adenine dinucleotide phosphate).

2. The Light-Independent Reactions / Calvin Cycle (Chloroplast Stroma):
Using the chemical currency of ATP and NADPH produced in the first stage, carbon dioxide from the atmosphere is enzymatically captured through ribulose-1,5-bisphosphate carboxylase/oxygenase (RuBisCO). Through sequential carbon-fixation cycles, organic triose phosphates are synthesized, eventually combining to form high-energy glucose and starches.

Significance to Global Ecology:
Beyond serving as the autotrophic food foundation of terrestrial and aquatic ecosystems, photosynthesis modulates planetary temperature by consuming vast volumes of atmospheric greenhouse gases and continuously renewing the atmospheric ozone shield.`,
  },
  bullets: {
    title: 'Key Takeaways: Quantum Computing & Qubit Mechanics',
    length: 'Detailed',
    format: 'Bullet Points',
    level: 'Undergraduate',
    isDemo: true,
    content: `• Fundamental Distinction: Classical computing relies on binary bits that exist deterministically as either 0 or 1. Quantum computing harnesses quantum mechanical phenomena to manipulate quantum bits (qubits) capable of multi-state representation.

• Principle of Superposition: A qubit is represented mathematically as a linear combination |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex probability amplitudes satisfying |α|² + |β|² = 1. This permits simultaneous exploration of vast combinatorial solution spaces.

• Quantum Entanglement: Multiple qubits can become correlated such that the quantum state of any individual qubit cannot be described independently of the state of the others, regardless of spatial distance. This grants exponential computational scaling (2ⁿ states simultaneously for n qubits).

• Quantum Decoherence & Error Mitigation: Quantum states are exquisitely susceptible to thermal noise, electromagnetic stray fields, and environmental perturbations. Modern hardware incorporates quantum error correction codes (such as surface codes) to preserve computational fidelity.

• Real-World Target Domains:
  - Cryptanalysis: Shor's algorithm provides polynomial-time prime factorization, challenging conventional RSA encryption.
  - Molecular Simulation: Grover's search algorithm and VQE (Variational Quantum Eigensolver) enable atomic-level chemical synthesis for pharmaceutical discovery and battery chemistry.
  - Optimization Logistics: Enhances supply chain distribution, financial risk modeling, and complex network routing.`,
  }
};

const TopicSummarizer: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [length, setLength] = useState<'Short' | 'Medium' | 'Detailed'>('Medium');
  const [format, setFormat] = useState<'Paragraphs' | 'Bullet Points'>('Paragraphs');
  const [level, setLevel] = useState('High School');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemoFallbackActive, setIsDemoFallbackActive] = useState(false);
  
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const calculateReadingTime = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, minutes };
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setIsDemoFallbackActive(false);
    setSaveStatus('idle');

    try {
      const response = await api.post('/generate/summarize', {
        topic: topic.trim(),
        length,
        format,
        educational_level: level,
        source_material: sourceMaterial.trim() || undefined,
      });

      if (response.data && (response.data.content || response.data.title)) {
        const summaryData = {
          title: response.data.title || `${topic} Summary`,
          content: response.data.content,
          length,
          format,
          level,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isDemo: false
        };
        setResult(summaryData);

        // Auto-save history to library
        try {
          await api.post('/library/', {
            title: summaryData.title,
            type: 'summary',
            content: summaryData
          });
        } catch (sErr) {
          console.warn('Auto-save library failed:', sErr);
        }
      } else {
        throw new Error('Invalid response structure received from generator.');
      }
    } catch (err: any) {
      console.warn('API generation failed, offering demo fallback:', err);
      const statusCode = err.response?.status;
      const detail = err.response?.data?.detail;

      if (statusCode === 503 || (detail && detail.includes('503')) || !err.response) {
        setError('The AI service is currently unavailable or high in demand (503). You can load the guaranteed Faculty Presentation Demo below.');
      } else {
        setError(detail || 'Generation encountered an issue. You can try again or use the Presentation Demo.');
      }
      setIsDemoFallbackActive(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = (presetKey?: string) => {
    setError(null);
    setSaveStatus('idle');
    const demo = (format === 'Bullet Points' || presetKey === 'bullets') 
      ? DEMO_SUMMARIES.bullets 
      : DEMO_SUMMARIES.default;

    const chosenTitle = topic.trim() 
      ? `Summary: ${topic.trim()} (${level})` 
      : demo.title;

    setResult({
      ...demo,
      title: chosenTitle,
      length,
      format,
      level,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDemo: true
    });
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      const textToCopy = `${result.title}\n\n${result.content}\n\n---\nEducational Level: ${result.level} | Format: ${result.format}`;
      await navigator.clipboard.writeText(textToCopy);
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
        title: result.title,
        type: 'summary',
        content: {
          title: result.title,
          content: result.content,
          length: result.length,
          format: result.format,
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

  const handleDownloadTxt = () => {
    if (!result) return;
    const fileContent = `========================================================\n`
      + `${result.title.toUpperCase()}\n`
      + `========================================================\n`
      + `Educational Level: ${result.level || level}\n`
      + `Summary Length:    ${result.length || length}\n`
      + `Format:            ${result.format || format}\n`
      + `Generated:         ${new Date().toLocaleString()}\n`
      + `========================================================\n\n`
      + `${result.content}\n\n`
      + `--------------------------------------------------------\n`
      + `Created via AI Classroom Teaching Assistant\n`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = (result.title || 'Topic_Summary').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 35);
    link.download = `${sanitizedTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const readingStats = result ? calculateReadingTime(result.content) : { words: 0, minutes: 0 };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <Sparkles size={13} className="text-indigo-600" />
            <span>AI Knowledge Synthesizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Topic Summarizer</h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Synthesize lecture notes, research topics, or complex syllabus units into clear, tailored summaries for teaching and review.
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
            <span>Try Demo Summary</span>
          </button>
        </div>
      </div>

      {/* Main Configuration Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-7">
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Preset Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quick Sample Topics
              </label>
              <span className="text-xs text-slate-400">Click to populate</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_TOPICS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTopic(preset.topic)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition text-left ${
                    topic === preset.topic
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-medium'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Topic or Subject Matter <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Plate Tectonics and Continental Drift, or The Krebs Cycle..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 placeholder-slate-400 transition"
            />
          </div>

          {/* Optional Source Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Source Material or Raw Text <span className="text-xs font-normal text-slate-500">(Optional)</span>
              </label>
              {sourceMaterial && (
                <button
                  type="button"
                  onClick={() => setSourceMaterial('')}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear text
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={sourceMaterial}
              onChange={(e) => setSourceMaterial(e.target.value)}
              placeholder="Paste lecture transcript, textbook excerpt, or article paragraphs here for targeted synthesis..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 placeholder-slate-400 text-sm transition"
            />
          </div>

          {/* Configuration Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Length */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <AlignLeft size={14} className="text-indigo-600" />
                <span>Summary Length</span>
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              >
                <option value="Short">Short (Quick Overview ~100w)</option>
                <option value="Medium">Medium (Balanced ~250w)</option>
                <option value="Detailed">Detailed (In-depth ~500w)</option>
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ListOrdered size={14} className="text-indigo-600" />
                <span>Format Style</span>
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              >
                <option value="Paragraphs">Narrative Paragraphs</option>
                <option value="Bullet Points">Structured Bullet Points</option>
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
                <option value="Undergraduate">Undergraduate / College</option>
                <option value="Postgraduate">Postgraduate / Research</option>
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm hover:shadow transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Synthesizing Summary...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Summary</span>
                </>
              )}
            </button>

            {topic && (
              <button
                type="button"
                onClick={() => {
                  setTopic('');
                  setSourceMaterial('');
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

        {/* 503 Alert Banner with Presentation Safeguard */}
        {error && (
          <div className="mt-5 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-semibold text-amber-950">Generation Notice</p>
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
                <span>Try Demo Summary</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Result Display Card */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden animate-fade-in">
          {/* Card Action Header */}
          <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {result.level || level}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {result.format || format}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {result.length || length}
                </span>
                {result.isDemo && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Faculty Demo Mode
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {result.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{readingStats.minutes} min read ({readingStats.words} words)</span>
                </span>
                {result.timestamp && (
                  <span>Generated at {result.timestamp}</span>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Copy */}
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition"
                title="Copy formatted text to clipboard"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              {/* Download TXT */}
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition"
                title="Download as clean text document"
              >
                <Download size={14} className="text-slate-500" />
                <span>Download .txt</span>
              </button>

              {/* Save to Library */}
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

          {/* Toast / Save Notification */}
          {saveMessage && (
            <div className={`px-6 py-2.5 text-xs font-medium border-b flex items-center justify-between ${
              saveStatus === 'saved' ? 'bg-emerald-50/80 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-800 border-red-100'
            }`}>
              <span>{saveMessage}</span>
              <span className="text-2xl leading-none cursor-pointer" onClick={() => setSaveMessage('')}>&times;</span>
            </div>
          )}

          {/* Summary Body with Formatted Rendering */}
          <div className="p-6 md:p-8">
            <div className="prose prose-slate max-w-none">
              <div className="bg-slate-50/80 rounded-xl p-5 md:p-6 border border-slate-200/70 text-slate-800 leading-relaxed text-sm md:text-base space-y-4">
                {result.content.split('\n\n').map((paragraph, idx) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  // Render list items gracefully if it starts with bullet or dash
                  if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    const items = trimmed.split('\n').filter(Boolean);
                    return (
                      <ul key={idx} className="space-y-2.5 my-3 pl-2">
                        {items.map((item, itemIdx) => {
                          const cleanItem = item.replace(/^[-•*]\s*/, '');
                          const parts = cleanItem.split(':');
                          if (parts.length > 1 && parts[0].length < 40) {
                            return (
                              <li key={itemIdx} className="flex items-start gap-2.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                                <div>
                                  <strong className="text-slate-900 font-semibold">{parts[0]}:</strong>
                                  <span className="text-slate-700 ml-1">{parts.slice(1).join(':')}</span>
                                </div>
                              </li>
                            );
                          }
                          return (
                            <li key={itemIdx} className="flex items-start gap-2.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                              <span className="text-slate-700">{cleanItem}</span>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }

                  // Render numbered list items if detected
                  if (/^\d+\./.test(trimmed)) {
                    const lines = trimmed.split('\n').filter(Boolean);
                    return (
                      <div key={idx} className="space-y-3 my-3">
                        {lines.map((line, lIdx) => {
                          const match = line.match(/^(\d+\.)\s*(.*)/);
                          if (match) {
                            return (
                              <div key={lIdx} className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-3">
                                <span className="font-bold text-indigo-600 text-sm">{match[1]}</span>
                                <div className="text-slate-700 text-sm leading-relaxed">{match[2]}</div>
                              </div>
                            );
                          }
                          return <p key={lIdx} className="text-slate-700">{line}</p>;
                        })}
                      </div>
                    );
                  }

                  // Standard narrative paragraph
                  return (
                    <p key={idx} className="text-slate-700 leading-relaxed">
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions footer */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-slate-400" />
                <span>Optimized for classroom handout distribution or LMS review modules</span>
              </div>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
              >
                <span>Adjust parameters</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicSummarizer;
