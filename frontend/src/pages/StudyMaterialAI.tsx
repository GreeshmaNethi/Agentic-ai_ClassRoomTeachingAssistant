import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  MessageSquare,
  Sparkles,
  BookOpen,
  HelpCircle,
  ListChecks,
  FileQuestion,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Copy,
  Check,
  ChevronRight,
  Globe
} from 'lucide-react';

interface StudyMaterial {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  summary: string;
  created_at: string;
}

const StudyMaterialAI: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Active Document Workspace
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null);
  const [activeDocumentText, setActiveDocumentText] = useState<string>('');
  const [loadingDocText, setLoadingDocText] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Telugu' | 'Hindi'>('English');

  // Interactive Q&A / Actions
  const [question, setQuestion] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<any | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // View modal
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/study-materials');
      setMaterials(res.data);
      if (res.data.length > 0 && !activeMaterial) {
        selectDocument(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load study materials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const selectDocument = async (mat: StudyMaterial) => {
    setActiveMaterial(mat);
    setActionResult(null);
    setActionError(null);
    setLoadingDocText(true);
    try {
      const res = await api.get(`/study-materials/${mat.id}`);
      setActiveDocumentText(res.data.extracted_text || '');
    } catch (err) {
      console.error('Failed to load document text', err);
    } finally {
      setLoadingDocText(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'txt'].includes(ext || '')) {
        setUploadError('Only PDF and TXT documents are supported.');
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/study-materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadSuccess(`"${selectedFile.name}" uploaded & parsed successfully!`);
      setSelectedFile(null);
      await fetchMaterials();
      selectDocument(res.data);
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number, filename: string) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
      await api.delete(`/study-materials/${id}`);
      if (activeMaterial?.id === id) {
        setActiveMaterial(null);
        setActiveDocumentText('');
        setActionResult(null);
      }
      await fetchMaterials();
    } catch (err) {
      alert('Failed to delete study material.');
    }
  };

  const executeAction = async (actionType: string, customQ?: string) => {
    if (!activeMaterial) return;

    setActionLoading(true);
    setActionError(null);

    const q = customQ !== undefined ? customQ : question;

    try {
      const res = await api.post(`/study-materials/${activeMaterial.id}/ask`, {
        question: q || 'Overview analysis',
        action_type: actionType,
        language
      });
      setActionResult({
        action: actionType,
        result: res.data
      });
      if (actionType === 'ask') {
        setQuestion('');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'AI processing encountered an error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const copyResultToClipboard = () => {
    if (!actionResult) return;
    const text = JSON.stringify(actionResult.result?.data || actionResult.result, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 mb-2">
            <Sparkles size={13} className="text-indigo-500" />
            <span>Document Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Study Material AI
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Upload course PDFs or syllabus lecture notes (TXT). Ask questions strictly grounded in the document or generate instant quizzes, summaries, and MCQs.
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <Globe size={16} className="text-indigo-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Response Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-indigo-600 dark:text-indigo-400 focus:outline-none"
          >
            <option value="English">English</option>
            <option value="Telugu">Telugu (తెలుగు)</option>
            <option value="Hindi">Hindi (हिन्दी)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Upload & File List on Left, Active Document Workstation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Upload Box & Uploaded Files List (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upload Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Upload size={18} className="text-indigo-600 dark:text-indigo-400" />
              <span>Upload Study Material</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Upload PDF or TXT files (e.g., "Machine Learning Unit 3.pdf").
            </p>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/40 relative">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileText className="mx-auto text-slate-400 dark:text-slate-500 mb-2" size={28} />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {selectedFile ? selectedFile.name : 'Click to select PDF or TXT file'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Maximum size: 20MB</p>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Extracting Text & Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    <span>Upload & Parse Material</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Files List Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Uploaded Documents</h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {materials.length} {materials.length === 1 ? 'File' : 'Files'}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-6 text-xs text-slate-400">
                <Loader2 size={20} className="animate-spin mx-auto mb-2 text-indigo-500" />
                Loading materials...
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4">
                No materials uploaded yet. Upload your first PDF/TXT above.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {materials.map((mat) => {
                  const isActive = activeMaterial?.id === mat.id;
                  return (
                    <div
                      key={mat.id}
                      onClick={() => selectDocument(mat)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            mat.file_type === 'pdf' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {mat.file_type}
                          </span>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={mat.filename}>
                            {mat.filename}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {Math.round(mat.file_size / 1024)} KB • {new Date(mat.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => { selectDocument(mat); setViewModalOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700"
                          title="View Extracted Text"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(mat.id, mat.filename)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700"
                          title="Delete File"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Document Q&A & Action Deck (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {activeMaterial ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 shadow-xs space-y-6">
              {/* Document Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      Active Material
                    </span>
                    <span className="text-xs text-slate-400">
                      Status: <strong className="text-emerald-500">Indexed & Ready</strong>
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {activeMaterial.filename}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setViewModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 self-start sm:self-auto"
                >
                  <Eye size={14} />
                  <span>View Raw Text</span>
                </button>
              </div>

              {/* Action Buttons Deck */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Quick AI Actions Based on Document
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <button
                    type="button"
                    onClick={() => executeAction('summarize')}
                    disabled={actionLoading}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/40 text-left transition flex flex-col justify-between group"
                  >
                    <BookOpen size={18} className="text-indigo-500 mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Summarize</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction('mcq')}
                    disabled={actionLoading}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/40 text-left transition flex flex-col justify-between group"
                  >
                    <ListChecks size={18} className="text-purple-500 mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Generate MCQs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction('quiz')}
                    disabled={actionLoading}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/40 text-left transition flex flex-col justify-between group"
                  >
                    <FileQuestion size={18} className="text-emerald-500 mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Generate Quiz</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction('explain_simply')}
                    disabled={actionLoading}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/40 text-left transition flex flex-col justify-between group"
                  >
                    <Lightbulb size={18} className="text-amber-500 mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Explain Simply</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction('important_questions')}
                    disabled={actionLoading}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/40 text-left transition flex flex-col justify-between group col-span-2 sm:col-span-1"
                  >
                    <HelpCircle size={18} className="text-rose-500 mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Important Questions</span>
                  </button>
                </div>
              </div>

              {/* Natural Language Question Form */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Ask AI About this Material
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && question.trim()) {
                        executeAction('ask');
                      }
                    }}
                    placeholder={`e.g., "What is overfitting?" or "Explain the main formulas..."`}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => executeAction('ask')}
                    disabled={actionLoading || !question.trim()}
                    className="px-5 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm flex items-center gap-2 text-sm cursor-pointer"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>

              {/* Action Error */}
              {actionError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Action Result Display Card */}
              {actionResult && (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Result: {actionResult.action.replace('_', ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={copyResultToClipboard}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Render based on action type */}
                  {actionResult.action === 'ask' && (
                    <div className="space-y-4 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {actionResult.result.data.answer}
                      </div>

                      {actionResult.result.data.relevant_excerpt && (
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 italic">
                          <strong>Source Excerpt: </strong> "{actionResult.result.data.relevant_excerpt}"
                        </div>
                      )}

                      {actionResult.result.data.key_points && actionResult.result.data.key_points.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Key Takeaways:</p>
                          <ul className="list-disc pl-5 text-xs space-y-1">
                            {actionResult.result.data.key_points.map((kp: string, idx: number) => (
                              <li key={idx}>{kp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {actionResult.action === 'summarize' && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {actionResult.result.data.title}
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {actionResult.result.data.content}
                      </p>
                    </div>
                  )}

                  {actionResult.action === 'explain_simply' && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {actionResult.result.data.concept}
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {actionResult.result.data.explanation}
                      </p>
                    </div>
                  )}

                  {actionResult.action === 'important_questions' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        Top Exam & Conceptual Questions:
                      </h4>
                      <div className="space-y-3">
                        {actionResult.result.data.questions?.map((q: string, i: number) => (
                          <div key={i} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              Q{i + 1}: {q}
                            </p>
                            {actionResult.result.data.sample_answers && actionResult.result.data.sample_answers[i] && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                <strong>Answer: </strong> {actionResult.result.data.sample_answers[i]}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {actionResult.action === 'mcq' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Generated Multiple Choice Questions:</h4>
                      <div className="space-y-3">
                        {actionResult.result.data.questions?.map((q: any, i: number) => (
                          <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {i + 1}. {q.question}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options?.map((opt: any, oIdx: number) => (
                                <div
                                  key={oIdx}
                                  className={`p-2 rounded-lg text-xs border ${
                                    opt.is_correct
                                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {opt.text} {opt.is_correct && '✓'}
                                </div>
                              ))}
                            </div>
                            <p className="text-[11px] text-slate-500 italic mt-1">
                              <strong>Explanation:</strong> {q.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {actionResult.action === 'quiz' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{actionResult.result.data.title}</h4>
                      <div className="space-y-3">
                        {actionResult.result.data.questions?.map((q: any, i: number) => (
                          <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {i + 1}. {q.question}
                            </p>
                            {q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt: string, oIdx: number) => (
                                  <div key={oIdx} className="p-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                              Answer: {q.answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center shadow-xs">
              <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Document Selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Upload a course PDF or select an uploaded file from the left to begin grounded AI inquiry and quiz synthesis.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Extracted Text Modal */}
      {viewModalOpen && activeMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {activeMaterial.filename} (Extracted Text)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50/40 dark:bg-slate-950/40">
              {loadingDocText ? (
                <div className="text-center py-12">
                  <Loader2 size={24} className="animate-spin mx-auto text-indigo-500 mb-2" />
                  Loading document content...
                </div>
              ) : (
                activeDocumentText || 'No text extracted.'
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterialAI;
