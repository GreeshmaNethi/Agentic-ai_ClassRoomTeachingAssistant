import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BookOpen, FileText, Trash2, X, Copy, Check, Search, Filter } from 'lucide-react';

const Library = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchLibrary = async () => {
    try {
      const { data } = await api.get('/library');
      setMaterials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item from your library?')) {
      try {
        await api.delete(`/library/${id}`);
        fetchLibrary();
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCopyContent = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const renderContentPreview = (content: any) => {
    if (typeof content === 'string') return content;
    if (content?.tasks && Array.isArray(content.tasks)) {
      return `${content.title || 'Assignment'}\n\nInstructions:\n${content.instructions || 'N/A'}\n\nTasks:\n` +
        content.tasks.map((t: any, i: number) => `Task ${i + 1}: ${t.title}\n${t.description}\nExpected Outcome: ${t.expected_outcome}`).join('\n\n');
    }
    if (content?.questions && Array.isArray(content.questions)) {
      return (content.title ? `${content.title}\n\n` : '') +
        content.questions.map((q: any, i: number) => {
          let str = `${i + 1}. ${q.question}\n`;
          if (q.options && Array.isArray(q.options)) {
            str += q.options.map((o: any) => typeof o === 'string' ? `   - ${o}` : `   - ${o.text} ${o.is_correct ? '✓ (Correct)' : ''}`).join('\n') + '\n';
          }
          if (q.answer) str += `Answer: ${q.answer}\n`;
          if (q.explanation) str += `Explanation: ${q.explanation}\n`;
          return str;
        }).join('\n\n');
    }
    if (content?.content) return typeof content.content === 'string' ? content.content : JSON.stringify(content.content, null, 2);
    if (content?.explanation) return content.explanation;
    if (content?.note) return content.note;
    return JSON.stringify(content, null, 2);
  };

  const filteredMaterials = materials.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = typeFilter === 'all' || item.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 dark:text-slate-400">
        <span>Loading library materials...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Teaching & Learning Library</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            All your generated quizzes, summaries, concepts, and notes are automatically saved here. You can view, copy, or remove items at any time.
          </p>
        </div>
        <span className="text-xs font-semibold px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
          {materials.length} {materials.length === 1 ? 'Item' : 'Items'} Saved
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved materials by title or topic..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
          <Filter size={16} className="text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Types</option>
            <option value="quiz">Quizzes</option>
            <option value="mcq">MCQs</option>
            <option value="summary">Summaries</option>
            <option value="concept">Concepts</option>
            <option value="assignment">Assignments</option>
            <option value="practice">Practice Questions</option>
          </select>
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
          <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No items found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            {materials.length === 0
              ? 'Generate any educational content, and it will be automatically saved here to your history!'
              : 'No items match your search filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((item: any) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {item.type}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-400 hover:text-red-500 p-1 transition"
                    title="Delete item from library"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Saved on {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-semibold text-xs transition"
                >
                  <FileText size={15} className="mr-1.5" /> View Content
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Content Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 rounded">
                  {selectedItem.type}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">{selectedItem.title}</h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {renderContentPreview(selectedItem.content)}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center space-x-1"
              >
                <Trash2 size={14} />
                <span>Remove from Library</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopyContent(renderContentPreview(selectedItem.content))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Content</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
