"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API } from "@/lib/api";

interface RecentNote {
  id: string;
  title: string;
  updatedAt: string;
  tags: string[];
}

interface TagCount {
  tag: string;
  count: number;
}

interface AiStats {
  totalAiGenerations: number;
  notesWithSummary: number;
}

interface Insights {
  totalNotes: number;
  recentlyEditedNotes: RecentNote[];
  mostUsedTags: TagCount[];
  aiStats: AiStats;
  weeklyActivity: Record<string, number>;
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

function getDayLabel(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export default function InsightsPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(API.analytics);
        setInsights(res.data.insights);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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

  if (error || !insights) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-400/80 font-mono text-xs uppercase tracking-widest">
          Failed to load insights.
        </p>
      </div>
    );
  }

  const weeklyEntries = Object.entries(insights.weeklyActivity).sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );
  const maxActivity = Math.max(...weeklyEntries.map(([, v]) => v), 1);
  const maxTagCount = Math.max(...insights.mostUsedTags.map((t) => t.count), 1);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="max-w-5xl mx-auto px-6 py-12">

        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-white">Insights.</h1>
            <div className="w-8 h-px bg-cyan-400 mt-3 mb-2" />
            <p className="text-gray-500 text-[11px] uppercase tracking-[0.2em] font-bold">
              Your workspace at a glance
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-[10px] font-mono uppercase tracking-widest text-gray-500 hover:text-cyan-400 transition-colors"
          >
            ← Notes
          </button>
        </div>

        <div className="flex items-stretch border border-cyan-900/30 mb-10 divide-x divide-cyan-900/30">
          <div className="px-8 py-6 flex flex-col">
            <div className="text-5xl font-mono text-cyan-400 mb-1">{insights.totalNotes}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Total Notes</div>
          </div>
          <div className="px-6 py-6 flex flex-col">
            <div className="text-5xl font-mono text-cyan-400/70 mb-1">{insights.aiStats.totalAiGenerations}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">AI Generations</div>
          </div>
          <div className="px-6 py-6 flex flex-col">
            <div className="text-5xl font-mono text-cyan-400/70 mb-1">{insights.aiStats.notesWithSummary}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Summarized</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-cyan-900/30 p-6">
            <p className="text-[15px] font-mono uppercase tracking-widest text-gray-500 mb-6">
              Weekly Activity
            </p>
            {weeklyEntries.length === 0 ? (
              <p className="text-gray-700 text-[10px] font-mono uppercase tracking-widest">
                No activity this week.
              </p>
            ) : (
              <div className="flex items-end gap-3 h-32">
                {weeklyEntries.map(([date, count]) => (
                  <div key={date} className="flex flex-col items-center gap-2 flex-1 max-w-10">
                    <span className="text-[13px] font-mono text-gray-600">{count}</span>
                    <div
                      className="w-full bg-cyan-400/20 border border-cyan-900/40 relative"
                      style={{ height: `${(count / maxActivity) * 96}px`, minHeight: "4px" }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-cyan-400"
                        style={{ height: `${(count / maxActivity) * 100}%` }}
                      />
                    </div>
                    <span className="text-[12px] font-mono text-gray-600 uppercase">
                      {getDayLabel(date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-cyan-900/30 p-6">
            <p className="text-[15px] font-mono uppercase tracking-widest text-gray-500 mb-6">
              Most Used Tags
            </p>
            {insights.mostUsedTags.length === 0 ? (
              <p className="text-gray-700 text-[10px] font-mono uppercase tracking-widest">
                No tags yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {insights.mostUsedTags.map(({ tag, count }) => (
                  <div key={tag} className="flex items-center gap-3">
                    <span className="text-[12px] font-mono uppercase tracking-widest text-gray-400 w-20 truncate">
                      {tag}
                    </span>
                    <div className="flex-1 h-px bg-cyan-900/30 relative">
                      <div
                        className="absolute left-0 top-0 h-full bg-cyan-400"
                        style={{ width: `${(count / maxTagCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-[12px] font-mono text-cyan-400/60 w-4 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="border border-cyan-900/30">
          <div className="px-6 py-4 border-b border-cyan-900/30">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
              Recently Edited
            </p>
          </div>
          <div className="flex flex-col gap-px">
            {insights.recentlyEditedNotes.map((note) => (
              <a
                key={note.id}
                href={`/notes/${note.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-cyan-900/10 border-l-2 border-l-transparent hover:border-l-cyan-400 transition-all"
              >
                <span className="text-base text-gray-300 truncate max-w-xs">
                  {note.title || "Untitled"}
                </span>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex gap-1">
                    {note.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-mono uppercase tracking-widest bg-cyan-950/30 border border-cyan-900/40 text-cyan-400 px-1.5 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                    {getRelativeTime(note.updatedAt)}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}