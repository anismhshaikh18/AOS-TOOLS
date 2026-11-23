import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Keyboard,
  ListTodo,
  StickyNote,
  Timer,
  Key,
  Link2,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Copy,
  Check,
  Plus,
  Trash2,
  Pin,
  Download,
  Search,
  RefreshCw,
  ArrowUpDown,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react';
import { ToolItem } from '../types';
import { StarRatingWidget } from '../components/StarRatingWidget';
import { readSessionDraft, writeSessionDraft } from '../utils/sessionDraftStorage';

interface UtilityToolStudioViewProps {
  tool: ToolItem;
  onBack: () => void;
}

export const UTILITY_STUDIO_TOOL_IDS = new Set<string>([
  'typing-test',
  'todo-list',
  'notes-app',
  'stopwatch',
  'password-generator',
  'url-encoder-decoder',
]);

/* ============================================================================
   1. TYPING SPEED TEST (WPM, Accuracy %, Net CPM, Personal Best)
   ============================================================================ */
const TYPING_PASSAGES: Array<{ id: string; label: string; text: string }> = [
  {
    id: 'office',
    label: 'Office & Digital Desk',
    text: 'Accurate typing speed helps citizen service operators complete online forms, verify applicant details, and prepare official print documents without delays. Focus on steady rhythm and clean accuracy before pushing for higher words per minute.',
  },
  {
    id: 'tech',
    label: 'Modern Web & Security',
    text: 'Client-side browser utilities process documents locally in device memory without uploading sensitive files to external servers. Strong passwords, clean URL encoding, and organized daily notes keep digital workflows fast and dependable.',
  },
  {
    id: 'exam',
    label: 'SSC / Clerical Practice',
    text: 'Public administration relies on clear communication, structured record keeping, and timely delivery of essential services. Practicing consistent finger placement every morning builds natural speed and reduces typing fatigue during examinations.',
  },
];

const TYPING_BEST_KEY = 'aos_typing_test_best_v1';

const TypingTestTool: React.FC = () => {
  const [durationSec, setDurationSec] = useState<30 | 60 | 120>(60);
  const [passageIdx, setPassageIdx] = useState<number>(0);
  const [typed, setTyped] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
  const [bestWpm, setBestWpm] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(TYPING_BEST_KEY) || '0');
      return Number.isFinite(saved) && saved > 0 ? saved : 0;
    } catch {
      return 0;
    }
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const passage = TYPING_PASSAGES[passageIdx % TYPING_PASSAGES.length];
  const targetText = passage.text;

  // Countdown timer while running
  useEffect(() => {
    if (status !== 'running') return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const metrics = useMemo(() => {
    let correctChars = 0;
    let wrongChars = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === targetText[i]) correctChars++;
      else wrongChars++;
    }
    const elapsedSec =
      status === 'idle' ? 0 : Math.max(1, durationSec - timeLeft);
    const minutes = elapsedSec / 60;
    const grossWpm = minutes > 0 ? Math.round(typed.length / 5 / minutes) : 0;
    const netWpm = minutes > 0 ? Math.max(0, Math.round(correctChars / 5 / minutes)) : 0;
    const accuracy =
      typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100;
    const cpm = minutes > 0 ? Math.round(correctChars / minutes) : 0;
    return { correctChars, wrongChars, grossWpm, netWpm, accuracy, cpm, elapsedSec };
  }, [typed, targetText, status, durationSec, timeLeft]);

  // Save personal best WPM on completion
  useEffect(() => {
    if (status === 'finished' && metrics.netWpm > bestWpm) {
      setBestWpm(metrics.netWpm);
      try {
        localStorage.setItem(TYPING_BEST_KEY, String(metrics.netWpm));
      } catch {
        // Ignored
      }
    }
  }, [status, metrics.netWpm, bestWpm]);

  const resetTest = useCallback(
    (nextDuration?: 30 | 60 | 120, nextPassageIdx?: number) => {
      const dur = nextDuration ?? durationSec;
      if (nextDuration !== undefined) setDurationSec(nextDuration);
      if (nextPassageIdx !== undefined) setPassageIdx(nextPassageIdx);
      setTyped('');
      setTimeLeft(dur);
      setStatus('idle');
      window.setTimeout(() => inputRef.current?.focus(), 20);
    },
    [durationSec]
  );

  const handleChange = (val: string) => {
    if (status === 'finished') return;
    if (status === 'idle' && val.length > 0) {
      setStatus('running');
    }
    const clipped = val.slice(0, targetText.length);
    setTyped(clipped);
    if (clipped.length >= targetText.length) {
      setStatus('finished');
    }
  };

  return (
    <div className="space-y-5">
      {/* Controls Row: Duration & Passage Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="aos-segmented-track inline-flex items-center gap-1 p-1">
          {([30, 60, 120] as const).map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => resetTest(sec)}
              className={`px-3.5 py-1.5 min-h-[38px] text-xs font-bold cursor-pointer whitespace-nowrap ${
                durationSec === sec ? 'aos-btn-soft-active' : 'aos-btn-soft-tab'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {TYPING_PASSAGES.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => resetTest(undefined, idx)}
              className={`px-3 py-1.5 min-h-[38px] text-xs font-semibold cursor-pointer whitespace-nowrap ${
                passageIdx === idx ? 'aos-btn-soft-active' : 'aos-btn-soft'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Metrics Strip (Tabular Numerals) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl liquid-glass-sub text-center">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-sky-200/75">
            Net Speed
          </div>
          <div className="text-2xl font-black text-[#0284c7] dark:text-sky-300 font-mono tabular-nums mt-0.5">
            {metrics.netWpm} <span className="text-xs font-bold">WPM</span>
          </div>
        </div>
        <div className="p-3.5 rounded-2xl liquid-glass-sub text-center">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-sky-200/75">
            Accuracy
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-0.5">
            {metrics.accuracy}%
          </div>
        </div>
        <div className="p-3.5 rounded-2xl liquid-glass-sub text-center">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-sky-200/75">
            Time Left
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
            {timeLeft}s
          </div>
        </div>
        <div className="p-3.5 rounded-2xl liquid-glass-sub text-center">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-sky-200/75">
            Best WPM
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-300 font-mono tabular-nums mt-0.5">
            {bestWpm}
          </div>
        </div>
      </div>

      {/* Target Passage Live Highlighter */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="p-5 rounded-2xl liquid-glass-sub border border-slate-200 dark:border-sky-500/25 font-mono text-sm sm:text-base leading-relaxed select-none cursor-text"
      >
        {targetText.split('').map((char, idx) => {
          let cls = 'text-slate-400 dark:text-slate-500';
          if (idx < typed.length) {
            cls =
              typed[idx] === char
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400 bg-rose-500/15 rounded-xs';
          } else if (idx === typed.length && status !== 'finished') {
            cls =
              'text-slate-900 dark:text-white bg-[#0284c7]/25 border-b-2 border-[#0284c7]';
          }
          return (
            <span key={idx} className={cls}>
              {char}
            </span>
          );
        })}
      </div>

      {/* Typing Input Area */}
      <div className="space-y-2">
        <textarea
          ref={inputRef}
          rows={3}
          value={typed}
          disabled={status === 'finished'}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Start typing the passage above — timer begins automatically on your first keystroke..."
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="w-full p-4 rounded-2xl liquid-glass-sub border border-slate-200 dark:border-sky-500/30 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/50 disabled:opacity-60"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-600 dark:text-slate-300 font-mono tabular-nums">
            Chars: {typed.length}/{targetText.length} · Errors: {metrics.wrongChars} · CPM:{' '}
            {metrics.cpm}
          </div>
          <button
            type="button"
            onClick={() => resetTest()}
            className="aos-btn-primary px-4 py-2 min-h-[42px] text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{status === 'finished' ? 'Try Again' : 'Restart Test'}</span>
          </button>
        </div>
      </div>

      {status === 'finished' && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              Test Complete: {metrics.netWpm} WPM at {metrics.accuracy}% accuracy ({metrics.correctChars}{' '}
              correct characters)
            </span>
          </div>
          <button
            type="button"
            onClick={() => resetTest(undefined, (passageIdx + 1) % TYPING_PASSAGES.length)}
            className="aos-btn-soft px-3.5 py-2 min-h-[40px] text-xs font-bold cursor-pointer"
          >
            Next Passage
          </button>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   2. TODO LIST (Local Storage Persisted, Priorities, Categories, Filters)
   ============================================================================ */
interface TodoTask {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'normal' | 'low';
  category: 'Work' | 'Counter' | 'Personal';
  createdAt: number;
}

const TODO_STORAGE_KEY = 'aos_utility_todos_v1';

const TodoListTool: React.FC = () => {
  const [tasks, setTasks] = useState<TodoTask[]>(() => {
    try {
      const raw = localStorage.getItem(TODO_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback starter tasks
    }
    return [
      {
        id: 'starter-1',
        text: 'Verify client PAN & Aadhaar supporting PDFs under 300 KB',
        completed: false,
        priority: 'high',
        category: 'Counter',
        createdAt: Date.now() - 3600_000,
      },
      {
        id: 'starter-2',
        text: 'Print 4×6 passport photo sheet batch for afternoon pickup',
        completed: false,
        priority: 'normal',
        category: 'Work',
        createdAt: Date.now() - 1800_000,
      },
    ];
  });

  const [newText, setNewText] = useState('');
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [category, setCategory] = useState<'Work' | 'Counter' | 'Personal'>('Work');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    try {
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore quota errors
    }
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: trimmed,
        completed: false,
        priority,
        category,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setNewText('');
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((item) => !item.completed));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.length - completedCount;
  const pct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const visibleTasks = useMemo(() => {
    return tasks.filter((item) => {
      if (filter === 'active') return !item.completed;
      if (filter === 'completed') return item.completed;
      return true;
    });
  }, [tasks, filter]);

  return (
    <div className="space-y-5">
      {/* Add Task Form */}
      <form onSubmit={addTask} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Add a task (e.g., Follow up on Smart Card application)..."
            className="flex-1 min-h-[46px] px-4 rounded-2xl liquid-glass-sub border border-slate-200 dark:border-sky-500/30 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/50"
          />
          <button
            type="submit"
            className="aos-btn-primary px-5 min-h-[46px] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-sky-200/75 font-semibold">Priority:</span>
            {(['high', 'normal', 'low'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`px-3 py-1 min-h-[34px] text-[11px] font-bold capitalize cursor-pointer ${
                  priority === p ? 'aos-btn-soft-active' : 'aos-btn-soft'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-sky-200/75 font-semibold">Group:</span>
            {(['Work', 'Counter', 'Personal'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 min-h-[34px] text-[11px] font-bold cursor-pointer ${
                  category === cat ? 'aos-btn-soft-active' : 'aos-btn-soft'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Progress & Filter Bar */}
      <div className="p-4 rounded-2xl liquid-glass-sub space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
            {completedCount} of {tasks.length} completed ({pct}%) · {activeCount} remaining
          </div>
          <div className="flex items-center gap-2">
            <div className="aos-segmented-track inline-flex items-center gap-1 p-1">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 min-h-[32px] text-[11px] font-bold capitalize cursor-pointer ${
                    filter === f ? 'aos-btn-soft-active' : 'aos-btn-soft-tab'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={clearCompleted}
                className="aos-btn-soft px-3 py-1.5 min-h-[34px] text-[11px] font-bold text-rose-600 dark:text-rose-300 cursor-pointer"
              >
                Clear Done
              </button>
            )}
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-[#061426] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0284c7] to-emerald-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {visibleTasks.length === 0 ? (
          <div className="p-8 rounded-2xl liquid-glass-sub text-center text-xs text-slate-500 dark:text-slate-400">
            No tasks in this view. Add a new task above to get started.
          </div>
        ) : (
          visibleTasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 rounded-2xl liquid-glass-sub flex items-center justify-between gap-3 transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className="flex items-start gap-3 text-left flex-1 min-w-0 min-h-[40px] py-1 cursor-pointer"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 dark:text-sky-300/60 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <div
                    className={`text-sm font-semibold break-words ${
                      task.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.text}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-sky-200/70 mt-0.5 flex items-center gap-2">
                    <span>{task.category}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        task.priority === 'high'
                          ? 'text-rose-600 dark:text-rose-400 font-semibold'
                          : task.priority === 'low'
                          ? 'text-slate-500 dark:text-slate-400'
                          : 'text-[#0284c7] dark:text-sky-300 font-semibold'
                      }
                    >
                      {task.priority === 'high'
                        ? 'High priority'
                        : task.priority === 'low'
                        ? 'Low priority'
                        : 'Normal'}
                    </span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
                className="aos-btn-icon w-9 h-9 text-rose-500 hover:text-rose-600 cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   3. NOTES APP (Local Storage Auto-Save, Pinning, Search, Export .txt)
   ============================================================================ */
interface QuickNote {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  updatedAt: number;
}

const NOTES_STORAGE_KEY = 'aos_utility_notes_v1';

const NotesAppTool: React.FC = () => {
  const [notes, setNotes] = useState<QuickNote[]>(() => {
    try {
      const raw = localStorage.getItem(NOTES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return [
      {
        id: 'welcome-note',
        title: 'Daily Counter Scratchpad',
        body: 'Keep quick reference details, fee notes, or reminders here. All notes are stored locally on your device with zero uploads.',
        pinned: true,
        updatedAt: Date.now(),
      },
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => notes[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedNote, setCopiedNote] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Ignore quota
    }
  }, [notes]);

  const sortedFilteredNotes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return [...notes]
      .filter(
        (n) =>
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q)
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }, [notes, searchTerm]);

  const activeNote =
    notes.find((n) => n.id === activeNoteId) || sortedFilteredNotes[0] || null;

  const createNote = () => {
    const fresh: QuickNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: 'Untitled Note',
      body: '',
      pinned: false,
      updatedAt: Date.now(),
    };
    setNotes((prev) => [fresh, ...prev]);
    setActiveNoteId(fresh.id);
  };

  const updateActiveNote = (patch: Partial<Pick<QuickNote, 'title' | 'body' | 'pinned'>>) => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id ? { ...n, ...patch, updatedAt: Date.now() } : n
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      if (activeNoteId === id) {
        setActiveNoteId(next[0]?.id || '');
      }
      return next;
    });
  };

  const handleCopyNote = async () => {
    if (!activeNote) return;
    try {
      await navigator.clipboard.writeText(`${activeNote.title}\n\n${activeNote.body}`);
      setCopiedNote(true);
      window.setTimeout(() => setCopiedNote(false), 1800);
    } catch {
      // Ignored
    }
  };

  const handleDownloadTxt = () => {
    if (!activeNote) return;
    const blob = new Blob([`${activeNote.title}\n\n${activeNote.body}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const slug = (activeNote.title || 'aos-note')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 32);
    link.download = `${slug || 'aos-note'}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const wordCount = activeNote?.body.trim()
    ? activeNote.body.trim().split(/\s+/).length
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left Sidebar: Notes List */}
      <div className="lg:col-span-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter notes..."
              className="w-full min-h-[40px] pl-9 pr-3 rounded-full liquid-glass-sub text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/40"
            />
          </div>
          <button
            type="button"
            onClick={createNote}
            className="aos-btn-primary px-3.5 min-h-[40px] text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>

        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
          {sortedFilteredNotes.length === 0 ? (
            <div className="p-4 rounded-2xl liquid-glass-sub text-xs text-slate-500 dark:text-slate-400 text-center">
              No matching notes.
            </div>
          ) : (
            sortedFilteredNotes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setActiveNoteId(note.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#0284c7]/15 dark:bg-[#0284c7]/25 border-[#0284c7]'
                      : 'liquid-glass-sub border-transparent hover:border-[#0284c7]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {note.title || 'Untitled Note'}
                    </span>
                    {note.pinned && (
                      <Pin className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-300 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {note.body || 'Empty note...'}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Active Note Editor */}
      <div className="lg:col-span-8">
        {activeNote ? (
          <div className="p-4 rounded-2xl liquid-glass-sub space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => updateActiveNote({ title: e.target.value })}
                placeholder="Note title..."
                className="flex-1 min-w-[180px] text-base font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none border-b border-transparent focus:border-[#0284c7] py-1"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateActiveNote({ pinned: !activeNote.pinned })}
                  title={activeNote.pinned ? 'Unpin note' : 'Pin note'}
                  className={`w-9 h-9 cursor-pointer ${
                    activeNote.pinned ? 'aos-btn-soft-active rounded-full inline-flex items-center justify-center' : 'aos-btn-icon'
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCopyNote}
                  title="Copy note"
                  className="aos-btn-icon w-9 h-9 cursor-pointer"
                >
                  {copiedNote ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  title="Export as .txt"
                  className="aos-btn-icon w-9 h-9 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteNote(activeNote.id)}
                  title="Delete note"
                  className="aos-btn-icon w-9 h-9 text-rose-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <textarea
              rows={10}
              value={activeNote.body}
              onChange={(e) => updateActiveNote({ body: e.target.value })}
              placeholder="Write your note here... Changes auto-save locally in your browser."
              className="w-full p-3.5 rounded-xl bg-white dark:bg-[#061426] border border-slate-200 dark:border-sky-500/25 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/40 leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-sky-200/75 font-mono tabular-nums">
              <span>
                {wordCount} words · {activeNote.body.length} chars · Auto-saved locally
              </span>
              <span>
                Updated {new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-10 rounded-2xl liquid-glass-sub text-center space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No notes yet. Create your first local note.
            </p>
            <button
              type="button"
              onClick={createNote}
              className="aos-btn-primary px-4 py-2 min-h-[42px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Note</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   4. PRECISION STOPWATCH & LAP TIMER (requestAnimationFrame 60fps)
   ============================================================================ */
interface LapItem {
  id: number;
  totalMs: number;
  splitMs: number;
}

const STOPWATCH_DRAFT_KEY = 'aos_utility_stopwatch_v1';

function formatStopwatchMs(ms: number): string {
  const safe = Math.max(0, Math.floor(ms));
  const hours = Math.floor(safe / 3_600_000);
  const mins = Math.floor((safe % 3_600_000) / 60_000);
  const secs = Math.floor((safe % 60_000) / 1000);
  const centis = Math.floor((safe % 1000) / 10);
  const base = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  return hours > 0 ? `${String(hours).padStart(2, '0')}:${base}` : base;
}

const StopwatchTool: React.FC = () => {
  const savedDraft = useRef(
    readSessionDraft<{ elapsedMs: number; laps: LapItem[] }>(STOPWATCH_DRAFT_KEY, {
      elapsedMs: 0,
      laps: [],
    })
  ).current;

  const [elapsedMs, setElapsedMs] = useState<number>(savedDraft.elapsedMs);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<LapItem[]>(savedDraft.laps);
  const [copiedLaps, setCopiedLaps] = useState(false);

  const startEpochRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      writeSessionDraft(STOPWATCH_DRAFT_KEY, { elapsedMs, laps });
    }
  }, [isRunning, elapsedMs, laps]);

  useEffect(() => {
    if (!isRunning) return;
    startEpochRef.current = performance.now() - elapsedMs;

    const tick = () => {
      setElapsedMs(performance.now() - startEpochRef.current);
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const handleToggle = () => {
    setIsRunning((prev) => !prev);
  };

  const handleLap = () => {
    if (elapsedMs <= 0) return;
    const prevTotal = laps.length > 0 ? laps[0].totalMs : 0;
    const splitMs = Math.max(0, elapsedMs - prevTotal);
    setLaps((prev) => [
      { id: prev.length + 1, totalMs: elapsedMs, splitMs },
      ...prev,
    ]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
    writeSessionDraft(STOPWATCH_DRAFT_KEY, { elapsedMs: 0, laps: [] });
  };

  const handleCopyLaps = async () => {
    if (laps.length === 0) return;
    const lines = [...laps]
      .reverse()
      .map(
        (l) =>
          `Lap ${l.id}: Split ${formatStopwatchMs(l.splitMs)} | Total ${formatStopwatchMs(l.totalMs)}`
      );
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedLaps(true);
      window.setTimeout(() => setCopiedLaps(false), 1800);
    } catch {
      // Ignored
    }
  };

  const { fastestId, slowestId } = useMemo(() => {
    if (laps.length < 2) return { fastestId: -1, slowestId: -1 };
    let min = laps[0];
    let max = laps[0];
    for (const l of laps) {
      if (l.splitMs < min.splitMs) min = l;
      if (l.splitMs > max.splitMs) max = l;
    }
    return { fastestId: min.id, slowestId: max.id };
  }, [laps]);

  return (
    <div className="space-y-6">
      {/* Main Digital Chrono Readout */}
      <div className="p-6 sm:p-10 rounded-3xl liquid-glass-sub text-center space-y-6">
        <div className="text-4xl sm:text-6xl font-black font-mono tabular-nums tracking-tight text-slate-900 dark:text-white">
          {formatStopwatchMs(elapsedMs)}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className="aos-btn-primary px-7 min-h-[48px] text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause' : elapsedMs > 0 ? 'Resume' : 'Start'}</span>
          </button>

          <button
            type="button"
            onClick={handleLap}
            disabled={elapsedMs <= 0}
            className="aos-btn-soft px-5 min-h-[48px] text-sm font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-45"
          >
            <Flag className="w-4 h-4 text-[#0284c7] dark:text-sky-300" />
            <span>Lap</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={elapsedMs <= 0 && laps.length === 0}
            className="aos-btn-soft px-5 min-h-[48px] text-sm font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-45"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Laps Split Table */}
      {laps.length > 0 && (
        <div className="rounded-2xl liquid-glass-sub overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-sky-500/20 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-sky-100 tabular-nums">
              Recorded Laps ({laps.length})
            </span>
            <button
              type="button"
              onClick={handleCopyLaps}
              className="aos-btn-soft px-3 py-1 min-h-[34px] text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLaps ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLaps ? 'Copied' : 'Copy Laps'}</span>
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 dark:text-sky-200/75">
                  <th className="px-4 py-2.5 font-semibold">Lap</th>
                  <th className="px-4 py-2.5 font-semibold">Split Time</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Total Time</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {laps.map((lap) => (
                  <tr key={lap.id}>
                    <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">
                      #{lap.id}
                      {lap.id === fastestId && (
                        <span className="ml-2 text-[10px] font-sans font-bold text-emerald-600 dark:text-emerald-400">
                          Fastest
                        </span>
                      )}
                      {lap.id === slowestId && (
                        <span className="ml-2 text-[10px] font-sans font-bold text-amber-600 dark:text-amber-300">
                          Slowest
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[#0284c7] dark:text-sky-300">
                      +{formatStopwatchMs(lap.splitMs)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-700 dark:text-slate-200">
                      {formatStopwatchMs(lap.totalMs)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   5. CRYPTOGRAPHIC PASSWORD GENERATOR (Web Crypto CSPRNG, Zero External APIs)
   ============================================================================ */
const PASSPHRASE_WORDS = [
  'sapphire', 'harbor', 'lantern', 'cobalt', 'river', 'summit', 'timber', 'orbit',
  'prism', 'cedar', 'meadow', 'falcon', 'anchor', 'breeze', 'quartz', 'beacon',
  'voyage', 'canyon', 'aurora', 'marble', 'zephyr', 'horizon', 'copper', 'atlas',
  'silver', 'granite', 'compass', 'delta', 'glacier', 'phoenix', 'spruce', 'vertex',
];

function secureRandomInt(maxExclusive: number): number {
  const arr = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
  let val = 0;
  do {
    crypto.getRandomValues(arr);
    val = arr[0];
  } while (val >= limit);
  return val % maxExclusive;
}

const PasswordGeneratorTool: React.FC = () => {
  const [mode, setMode] = useState<'password' | 'passphrase'>('password');
  const [length, setLength] = useState<number>(18);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(true);
  const [wordCount, setWordCount] = useState<number>(4);
  const [separator, setSeparator] = useState<string>('-');
  const [password, setPassword] = useState<string>('');
  const [batchList, setBatchList] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateOne = useCallback((): string => {
    if (mode === 'passphrase') {
      const words: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        const w = PASSPHRASE_WORDS[secureRandomInt(PASSPHRASE_WORDS.length)];
        words.push(w.charAt(0).toUpperCase() + w.slice(1));
      }
      const num = 10 + secureRandomInt(90);
      return `${words.join(separator)}${separator}${num}`;
    }

    const ambiguous = /[O0Il1|]/g;
    const strip = (s: string) => (excludeAmbiguous ? s.replace(ambiguous, '') : s);

    const sets: string[] = [];
    if (useUpper) sets.push(strip('ABCDEFGHIJKLMNOPQRSTUVWXYZ'));
    if (useLower) sets.push(strip('abcdefghijklmnopqrstuvwxyz'));
    if (useNumbers) sets.push(strip('0123456789'));
    if (useSymbols) sets.push('!@#$%^&*()-_=+[]{}?');

    if (sets.length === 0) sets.push(strip('abcdefghijklmnopqrstuvwxyz0123456789'));

    const fullPool = sets.join('');
    const chars: string[] = [];

    // Guarantee at least one char from each selected set
    for (const s of sets) {
      if (chars.length < length && s.length > 0) {
        chars.push(s[secureRandomInt(s.length)]);
      }
    }
    while (chars.length < length) {
      chars.push(fullPool[secureRandomInt(fullPool.length)]);
    }

    // Fisher-Yates CSPRNG shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  }, [mode, length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous, wordCount, separator]);

  useEffect(() => {
    setPassword(generateOne());
  }, [generateOne]);

  const entropyBits = useMemo(() => {
    if (mode === 'passphrase') {
      return Math.round(wordCount * Math.log2(PASSPHRASE_WORDS.length) + 6.5);
    }
    let pool = 0;
    if (useUpper) pool += excludeAmbiguous ? 24 : 26;
    if (useLower) pool += excludeAmbiguous ? 25 : 26;
    if (useNumbers) pool += excludeAmbiguous ? 8 : 10;
    if (useSymbols) pool += 19;
    pool = Math.max(10, pool);
    return Math.round(length * Math.log2(pool));
  }, [mode, length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous, wordCount]);

  const strengthInfo = useMemo(() => {
    if (entropyBits >= 90)
      return { label: 'Very Strong', color: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', pct: 100 };
    if (entropyBits >= 65)
      return { label: 'Strong', color: 'text-[#0284c7] dark:text-sky-300', bar: 'bg-[#0284c7]', pct: 78 };
    if (entropyBits >= 45)
      return { label: 'Moderate', color: 'text-amber-600 dark:text-amber-300', bar: 'bg-amber-500', pct: 52 };
    return { label: 'Weak', color: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500', pct: 28 };
  }, [entropyBits]);

  const copyValue = async (val: string, key: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="space-y-5">
      {/* Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="aos-segmented-track inline-flex items-center gap-1 p-1">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`px-4 py-1.5 min-h-[38px] text-xs font-bold cursor-pointer ${
              mode === 'password' ? 'aos-btn-soft-active' : 'aos-btn-soft-tab'
            }`}
          >
            Random Password
          </button>
          <button
            type="button"
            onClick={() => setMode('passphrase')}
            className={`px-4 py-1.5 min-h-[38px] text-xs font-bold cursor-pointer ${
              mode === 'passphrase' ? 'aos-btn-soft-active' : 'aos-btn-soft-tab'
            }`}
          >
            Memorable Passphrase
          </button>
        </div>

        <span className="text-xs font-mono text-slate-500 dark:text-sky-200/80 tabular-nums">
          Web Crypto CSPRNG · ~{entropyBits} bits entropy
        </span>
      </div>

      {/* Primary Generated Output Box */}
      <div className="p-5 rounded-2xl liquid-glass-sub space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <code className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white break-all select-all">
            {password}
          </code>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setPassword(generateOne())}
              aria-label="Regenerate password"
              className="aos-btn-soft px-3.5 min-h-[42px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <button
              type="button"
              onClick={() => copyValue(password, 'main')}
              className="aos-btn-primary px-4 min-h-[42px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              {copiedKey === 'main' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'main' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold ${strengthInfo.color}`}>
              Strength: {strengthInfo.label}
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {password.length} characters
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-[#061426] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-200 ${strengthInfo.bar}`}
              style={{ width: `${strengthInfo.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      {mode === 'password' ? (
        <div className="p-5 rounded-2xl liquid-glass-sub space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-200">Password Length</span>
              <span className="font-mono text-[#0284c7] dark:text-sky-300 tabular-nums">
                {length} chars
              </span>
            </div>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-[#0284c7] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { label: 'Uppercase (A-Z)', checked: useUpper, set: setUseUpper },
              { label: 'Lowercase (a-z)', checked: useLower, set: setUseLower },
              { label: 'Numbers (0-9)', checked: useNumbers, set: setUseNumbers },
              { label: 'Symbols (!@#$)', checked: useSymbols, set: setUseSymbols },
              { label: 'No Ambiguous (0/O/1/l)', checked: excludeAmbiguous, set: setExcludeAmbiguous },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => opt.set(!opt.checked)}
                className={`px-3.5 py-2.5 min-h-[42px] text-xs font-semibold text-left flex items-center justify-between gap-2 cursor-pointer ${
                  opt.checked ? 'aos-btn-soft-active' : 'aos-btn-soft'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {opt.checked && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl liquid-glass-sub grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-200">Word Count</span>
              <span className="font-mono text-[#0284c7] dark:text-sky-300 tabular-nums">
                {wordCount} words
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={7}
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full accent-[#0284c7] cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
              Separator
            </span>
            <div className="flex items-center gap-2">
              {['-', '.', '_', ' '].map((sep) => (
                <button
                  key={sep}
                  type="button"
                  onClick={() => setSeparator(sep)}
                  className={`px-3.5 py-1.5 min-h-[38px] text-xs font-mono font-bold cursor-pointer ${
                    separator === sep ? 'aos-btn-soft-active' : 'aos-btn-soft'
                  }`}
                >
                  {sep === ' ' ? 'Space' : sep}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Batch Generate 5 */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => setBatchList(Array.from({ length: 5 }, () => generateOne()))}
          className="aos-btn-soft px-4 py-2 min-h-[40px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-300" />
          <span>Generate 5 Options</span>
        </button>

        {batchList.length > 0 && (
          <div className="space-y-2">
            {batchList.map((item, idx) => (
              <div
                key={`${item}-${idx}`}
                className="px-4 py-2.5 rounded-xl liquid-glass-sub flex items-center justify-between gap-3"
              >
                <code className="text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-100 break-all">
                  {item}
                </code>
                <button
                  type="button"
                  onClick={() => copyValue(item, `batch-${idx}`)}
                  className="aos-btn-icon w-8 h-8 cursor-pointer shrink-0"
                  aria-label="Copy password option"
                >
                  {copiedKey === `batch-${idx}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   6. URL ENCODER / DECODER + QUERY PARAMETER INSPECTOR (Zero External APIs)
   ============================================================================ */
const URL_DRAFT_KEY = 'aos_utility_url_codec_v1';

const UrlEncoderDecoderTool: React.FC = () => {
  const saved = useRef(
    readSessionDraft<{
      mode: 'encode' | 'decode';
      scope: 'component' | 'full-uri';
      input: string;
    }>(URL_DRAFT_KEY, {
      mode: 'encode',
      scope: 'component',
      input: 'https://aos-tools.anismhshaikh18.workers.dev/?service=PAN Correction&name=Anis Shaikh',
    })
  ).current;

  const [mode, setMode] = useState<'encode' | 'decode'>(saved.mode);
  const [scope, setScope] = useState<'component' | 'full-uri'>(saved.scope);
  const [input, setInput] = useState<string>(saved.input);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      writeSessionDraft(URL_DRAFT_KEY, { mode, scope, input });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [mode, scope, input]);

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: null as string | null };
    try {
      if (mode === 'encode') {
        return {
          output: scope === 'component' ? encodeURIComponent(input) : encodeURI(input),
          error: null,
        };
      }
      const normalized = scope === 'component' ? input.replace(/\+/g, ' ') : input;
      return {
        output:
          scope === 'component' ? decodeURIComponent(normalized) : decodeURI(normalized),
        error: null,
      };
    } catch {
      return {
        output: '',
        error: 'Malformed percent-encoding sequence. Check for incomplete %xx tokens.',
      };
    }
  }, [input, mode, scope]);

  // Parse URL Query Parameters automatically when input or decoded output looks like a URL
  const parsedParams = useMemo(() => {
    const candidate = mode === 'decode' && output ? output : input;
    try {
      const url = new URL(candidate.trim());
      return Array.from(url.searchParams.entries());
    } catch {
      return [];
    }
  }, [input, output, mode]);

  const handleSwap = () => {
    if (!output) return;
    setInput(output);
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'));
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="space-y-5">
      {/* Mode & Encoding Scope Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="aos-segmented-track inline-flex items-center gap-1 p-1">
          <button
            type="button"
            onClick={() => setMode('encode')}
            className={`px-4 py-1.5 min-h-[38px] text-xs font-bold cursor-pointer ${
              mode === 'encode' ? 'aos-btn-soft-active' : 'aos-btn-soft-tab'
            }`}
          >
            URL Encode
          </button>
          <button
            type="button"
            onClick={() => setMode('decode')}
            className={`px-4 py-1.5 min-h-[38px] text-xs font-bold cursor-pointer ${
              mode === 'decode' ? 'aos-btn-soft-active' : 'aos-btn-soft-tab'
            }`}
          >
            URL Decode
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScope('component')}
            className={`px-3 py-1.5 min-h-[36px] text-xs font-semibold cursor-pointer ${
              scope === 'component' ? 'aos-btn-soft-active' : 'aos-btn-soft'
            }`}
          >
            encodeURIComponent
          </button>
          <button
            type="button"
            onClick={() => setScope('full-uri')}
            className={`px-3 py-1.5 min-h-[36px] text-xs font-semibold cursor-pointer ${
              scope === 'full-uri' ? 'aos-btn-soft-active' : 'aos-btn-soft'
            }`}
          >
            Full URI
          </button>
        </div>
      </div>

      {/* Input & Output Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-200">
              {mode === 'encode' ? 'Plain Text / Raw URL' : 'Encoded URL String'}
            </label>
            <button
              type="button"
              onClick={() => setInput('')}
              className="text-[11px] font-semibold text-slate-500 hover:text-[#0284c7] cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste URL or query text here..."
            className="w-full p-4 rounded-2xl liquid-glass-sub border border-slate-200 dark:border-sky-500/30 font-mono text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/40"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-200">
              {mode === 'encode' ? 'Percent-Encoded Result' : 'Decoded Output'}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSwap}
                disabled={!output}
                className="text-[11px] font-bold text-[#0284c7] dark:text-sky-300 inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Swap</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!output}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {error ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-start gap-2 min-h-[152px]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : (
            <textarea
              rows={6}
              readOnly
              value={output}
              placeholder="Instant result appears here..."
              className="w-full p-4 rounded-2xl liquid-glass-sub border border-slate-200 dark:border-sky-500/30 font-mono text-xs sm:text-sm text-[#0284c7] dark:text-sky-300 focus:outline-none"
            />
          )}
        </div>
      </div>

      {/* Automatic Query String Inspector */}
      {parsedParams.length > 0 && (
        <div className="rounded-2xl liquid-glass-sub overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-200 dark:border-sky-500/20 text-xs font-bold text-slate-700 dark:text-sky-100">
            Detected URL Query Parameters ({parsedParams.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 dark:text-sky-200/75">
                  <th className="px-4 py-2 font-semibold">Parameter Key</th>
                  <th className="px-4 py-2 font-semibold">Decoded Value</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {parsedParams.map(([k, v], idx) => (
                  <tr key={`${k}-${idx}`}>
                    <td className="px-4 py-2 font-bold text-[#0284c7] dark:text-sky-300">{k}</td>
                    <td className="px-4 py-2 text-slate-800 dark:text-slate-100 break-all">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   MAIN STUDIO SHELL FOR ALL 6 CLIENT-SIDE PRODUCTIVITY & SECURITY UTILITIES
   ============================================================================ */
export const UtilityToolStudioView: React.FC<UtilityToolStudioViewProps> = ({ tool, onBack }) => {
  const meta = useMemo(() => {
    switch (tool.id) {
      case 'typing-test':
        return {
          Icon: Keyboard,
          section: 'Productivity Utility · 100% On-Device',
          desc: 'Measure real-time typing speed (WPM), accuracy %, and CPM with saved personal best.',
        };
      case 'todo-list':
        return {
          Icon: ListTodo,
          section: 'Productivity Utility · Local Storage Synced',
          desc: 'Organize daily counter and personal tasks with priority levels, groups, and progress tracking.',
        };
      case 'notes-app':
        return {
          Icon: StickyNote,
          section: 'Productivity Utility · Offline Local Storage',
          desc: 'Fast multi-note scratchpad with pinning, instant search, auto-save, and .txt export.',
        };
      case 'stopwatch':
        return {
          Icon: Timer,
          section: 'Productivity Utility · 60fps Precision Timer',
          desc: 'High-precision stopwatch with split lap recording, fastest/slowest highlights, and copy log.',
        };
      case 'password-generator':
        return {
          Icon: Key,
          section: 'Security Utility · Web Crypto CSPRNG',
          desc: 'Generate high-entropy random passwords and passphrases locally using browser cryptography.',
        };
      case 'url-encoder-decoder':
      default:
        return {
          Icon: Link2,
          section: 'Security & Web Utility · Zero External APIs',
          desc: 'Encode or decode URL components, full URIs, and inspect query parameters instantaneously.',
        };
    }
  }, [tool.id]);

  const Icon = meta.Icon;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="aos-btn-soft inline-flex items-center gap-1.5 px-4 py-2 min-h-[42px] text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tools</span>
        </button>

        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Zero External APIs</span>
        </div>
      </div>

      {/* Main Tool Workspace Card */}
      <section className="p-5 sm:p-7 rounded-3xl liquid-glass border border-slate-200 dark:border-sky-400/20 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-sky-500/20">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0ea5e9] via-[#0284c7] to-[#0B192C] flex items-center justify-center text-white shadow-lg shadow-[#0284c7]/30 shrink-0 border border-sky-300/30">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#0284c7] dark:text-sky-300">
                {meta.section}
              </p>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {tool.name}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{meta.desc}</p>
            </div>
          </div>
          <StarRatingWidget toolId={tool.id} toolName={tool.name} className="shrink-0" />
        </div>

        {/* Active Utility Engine */}
        {tool.id === 'typing-test' && <TypingTestTool />}
        {tool.id === 'todo-list' && <TodoListTool />}
        {tool.id === 'notes-app' && <NotesAppTool />}
        {tool.id === 'stopwatch' && <StopwatchTool />}
        {tool.id === 'password-generator' && <PasswordGeneratorTool />}
        {tool.id === 'url-encoder-decoder' && <UrlEncoderDecoderTool />}
      </section>
    </div>
  );
};
