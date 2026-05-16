"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '@/lib/api';
import Link from 'next/link';
import { Delete } from 'lucide-react';

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

interface Note {
  id: string;
  title: string;
  plainText: string;
  tags: string[];
  category: string | null;
  isArchived: boolean;
  isPublic: boolean;
  shareId: string;
  aiUsageCount: number;
  aiGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NotesResponse {
  notes: Note[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<NotesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(false);
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        if (activeTag) params.set("tag", activeTag);
        const response = await axios.get(`${API.notes}?${params.toString()}`);
        if (mounted) {
          setData(response.data);
          setLoading(false);
        }
      } catch {
        if (mounted) { setError(true); setLoading(false); }
      }
    };
    fetchNotes();
    return () => { mounted = false; };
  }, [search, activeTag]);

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(noteId);
    try {
      await axios.delete(API.noteById(noteId));
      setData((prev) =>
        prev
          ? {
            ...prev,
            notes: prev.notes.filter((n) => n.id !== noteId),
            pagination: { ...prev.pagination, total: prev.pagination.total - 1 },
          }
          : prev
      );
    } catch {
    } finally {
      setDeletingId(null);
    }
  };

  const totalNotes = data?.pagination?.total || 0;
  const aiNotesCount = data?.notes.filter(n => n.aiGeneratedAt !== null).length || 0;
  const publicNotesCount = data?.notes.filter(n => n.isPublic === true).length || 0;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-white">Notes.</h1>
            <div className="w-8 h-px bg-cyan-400 mt-3 mb-2" />
            <p className="text-gray-500 text-[11px] uppercase tracking-[0.2em] font-bold">
              {totalNotes} total
            </p>
          </div>
          <Link
            href="/notes"
            className="bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase py-3 px-6 text-[11px] tracking-widest transition-colors active:scale-[0.98] inline-flex items-center gap-2 border-l-4 border-l-cyan-600 self-start"
          >
            + New Note
          </Link>
        </div>
        <div className="flex flex-col gap-3 mb-10">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full md:w-96 bg-transparent border border-cyan-900/30 focus:border-cyan-400/50 outline-none px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono rounded-xl transition-colors"
          />
          {data && data.notes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag("")}
                className={`text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border transition-colors ${activeTag === ""
                  ? "border-cyan-400 text-cyan-400 bg-cyan-950/30"
                  : "border-cyan-900/30 text-gray-500 hover:text-gray-300"
                  }`}
              >
                All
              </button>
              {[...new Set(data.notes.flatMap(n => n.tags))].map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                  className={`text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border transition-colors ${activeTag === tag
                    ? "border-cyan-400 text-cyan-400 bg-cyan-950/30"
                    : "border-cyan-900/30 text-gray-500 hover:text-gray-300"
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-stretch w-fit border border-cyan-900/30 mb-12 divide-x divide-cyan-900/30">
          <div className="px-8 py-5 flex flex-col">
            <div className="text-4xl font-mono text-cyan-400 mb-1">
              {loading ? '-' : totalNotes}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Total Notes</div>
          </div>
          <div className="px-8 py-5 flex flex-col">
            <div className="text-4xl font-mono text-cyan-400/70 mb-1">
              {loading ? '-' : aiNotesCount}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">AI Summarized</div>
          </div>
          <div className="px-8 py-5 flex flex-col">
            <div className="text-4xl font-mono text-cyan-400/50 mb-1">
              {loading ? '-' : publicNotesCount}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Public Notes</div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-cyan-900/10 animate-pulse border border-cyan-900/20"
              />
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center border border-cyan-900/30 rounded-2xl">
            <span className="text-red-400/80 font-mono text-[11px] uppercase tracking-widest">
              Failed to load notes.
            </span>
          </div>
        ) : data?.notes.length === 0 ? (
          <div className="py-24 text-center border border-cyan-900/30 rounded-2xl">
            <p className="text-gray-600 font-mono text-[11px] uppercase tracking-widest">
              {search || activeTag ? "No notes match your search." : "Nothing here yet."}
            </p>
            {!search && !activeTag && (
              <Link
                href="/notes/new"
                className="text-cyan-400/60 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em] text-[10px] font-mono mt-2 inline-block"
              >
                Create your first note
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="group relative flex flex-col justify-between p-5 rounded-2xl border border-cyan-500/10 bg-linear-to-b from-cyan-950/20 to-transparent backdrop-blur-sm hover:border-cyan-400/30 hover:from-cyan-950/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(34,211,238,0.08)] transition-colors duration-500 cursor-pointer"
              >
                <button
                  onClick={(e) => handleDelete(e, note.id)}
                  disabled={deletingId === note.id}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-colors text-xs font-mono disabled:opacity-30"
                  title="Delete note"
                >
                  {deletingId === note.id ? "..." : <Delete />}
                </button>

                <div className="mb-4 pr-6">
                  {note.category && (
                    <span className="inline-block text-[9px] font-mono uppercase tracking-widest text-cyan-400/60 border border-cyan-900/40 px-2 py-0.5 rounded-full mb-3">
                      {note.category}
                    </span>
                  )}

                  {note.isArchived && (
                    <span className="inline-block text-[9px] font-mono uppercase tracking-widest text-orange-400/70 border border-orange-900/40 px-2 py-0.5 rounded-full mb-3 ml-1">
                      Archived
                    </span>
                  )}


                  <h3 className="text-white font-semibold text-base leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {note.title || "Untitled"}
                  </h3>


                  {note.plainText && (
                    <p className="text-gray-600 text-xs leading-relaxed mt-2 line-clamp-3">
                      {note.plainText}
                    </p>
                  )}
                </div>

                <div className="flex items-end justify-between mt-auto pt-4 border-t border-cyan-900/20">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="bg-cyan-950/40 text-cyan-400 px-2 py-0.5 text-[9px] uppercase font-mono tracking-widest rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className="text-gray-600 text-[9px] font-mono">
                        +{note.tags.length - 2}
                      </span>
                    )}
                  </div>


                  <div className="flex items-center gap-2 shrink-0">
                    {note.aiGeneratedAt && (
                      <span className="text-cyan-400/40 text-[9px] font-mono uppercase tracking-widest">
                        AI
                      </span>
                    )}
                    <span className="text-gray-600 font-mono text-[9px] uppercase tracking-widest">
                      {getRelativeTime(note.updatedAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div >
  );
}