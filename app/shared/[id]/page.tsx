"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { API } from "@/lib/api";

interface AiSummary {
  id: string;
  summary: string;
  actionItems: string[];
  suggestedTitle: string | null;
  createdAt: string;
}

interface Note {
  id: string;
  title: string;
  plainText: string;
  tags: string[];
  category: string | null;
  isPublic: boolean;
  shareId: string;
  aiGeneratedAt: string | null;
  aiSummary?: AiSummary | null;
  createdAt: string;
  updatedAt: string;
}

export default function SharedNotePage() {
  const params = useParams();
  const id = params?.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await axios.get(API.shared(id));
        setNote(res.data.note);
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (fetchError || !note) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-red-400/80 font-mono text-xs uppercase tracking-widest">
          Note not found or no longer public.
        </p>
        <a
          href="/login"
          className="text-cyan-400 text-xs uppercase tracking-widest font-mono hover:underline"
        >
          Sign in to create your own →
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-cyan-900/30 bg-black sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-mono text-sm font-bold tracking-widest uppercase">
            ai-notes
          </span>
          <span className="text-gray-700 text-xs font-mono">/ shared</span>
        </div>
        <a
          href="/login"
          className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition-colors"
        >
          Create your own →
        </a>
      </header>

      <div className="flex flex-1">
        <div className="flex-1 px-8 py-10 max-w-3xl mx-auto w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-500 leading-tight mb-4 tracking-tight">
            {note.title || "Untitled Note"}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mb-8">
            {note.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center bg-cyan-950/30 border border-cyan-900/40 text-cyan-400 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest"
              >
                {t}
              </span>
            ))}
            {note.category && (
              <>
                <span className="text-gray-700 text-xs mx-1">·</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                  {note.category}
                </span>
              </>
            )}
            <span className="text-gray-700 text-xs mx-1">·</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-600">
              {new Date(note.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="w-8 h-px bg-cyan-900/40 mb-8" />

          <div className="text-gray-300 leading-relaxed text-base whitespace-pre-wrap">
            {note.plainText}
          </div>

          {note.aiSummary && (
            <div className="mt-16 border-t border-cyan-900/30 pt-10">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-6">
                AI Summary
              </p>

              <div className="flex flex-col gap-8">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-gray-600 mb-2">
                    Summary
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {note.aiSummary.summary}
                  </p>
                </div>

                {note.aiSummary.actionItems?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-gray-600 mb-2">
                      Action Items
                    </p>
                    <ul className="flex flex-col gap-2">
                      {note.aiSummary.actionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-cyan-400 mt-0.5 shrink-0">□</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {note.aiSummary.suggestedTitle && (
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-gray-600 mb-2">
                      Suggested Title
                    </p>
                    <p className="text-gray-300 text-sm italic">
                      &quot;{note.aiSummary.suggestedTitle}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="px-6 py-4 border-t border-cyan-900/30 flex items-center justify-between">
        <span className="text-gray-700 text-[10px] font-mono uppercase tracking-widest">
          Shared via ai-notes
        </span>
        <a
          href="/login"
          className="text-cyan-400 text-[10px] font-mono uppercase tracking-widest hover:underline"
        >
          Sign in to create your own →
        </a>
      </footer>
    </div>
  );
}