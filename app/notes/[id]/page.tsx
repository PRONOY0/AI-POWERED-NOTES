"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
  content: Record<string, unknown>;
  isArchived: boolean;
  isPublic: boolean;
  shareId: string;
  aiUsageCount: number;
  aiGeneratedAt: string | null;
  aiSummary?: AiSummary | null;
  createdAt: string;
  updatedAt: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const CATEGORIES = ["Work", "Personal", "Development", "Research", "Other"];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);


  const [title, setTitle] = useState("");
  const [plainText, setPlainText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [category, setCategory] = useState<string>("");

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const isFirstLoad = useRef(true);


  const debouncedTitle = useDebounce(title, 1500);
  const debouncedText = useDebounce(plainText, 1500);
  const debouncedTags = useDebounce(tags, 1500);
  const debouncedCategory = useDebounce(category, 1500);


  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await axios.get(API.noteById(id));
        const n: Note = res.data.note;
        setNote(n);
        setTitle(n.title);
        setPlainText(n.plainText);
        setTags(n.tags);
        setCategory(n.category ?? "");
        if (n.aiSummary) setAiSummary(n.aiSummary);
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);


  const save = useCallback(async () => {
    if (!id || isFirstLoad.current) return;
    setSaveStatus("saving");
    try {
      await axios.patch(API.noteById(id), {
        title: debouncedTitle,
        plainText: debouncedText,
        content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: debouncedText }] }] },
        tags: debouncedTags,
        category: debouncedCategory || null,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }, [id, debouncedTitle, debouncedText, debouncedTags, debouncedCategory]);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    save();
  }, [debouncedTitle, debouncedText, debouncedTags, debouncedCategory]);


  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !tags.includes(val)) setTags([...tags, val]);
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));


  const generateSummary = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const res = await axios.post(`${API.generateSummary(id)}`);
      setAiSummary(res.data.aiSummary);
    } catch {
      setAiError("Failed to generate summary. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const useSuggestedTitle = () => {
    if (aiSummary?.suggestedTitle) setTitle(aiSummary.suggestedTitle);
  };


  const togglePublic = async () => {
    if (!note) return;
    try {
      const newPublic = !note.isPublic;
      await axios.patch(API.noteById(id), { isPublic: newPublic });
      setNote({ ...note, isPublic: newPublic });
    } catch {

    }
  };

  const copyShareLink = () => {
    if (!note) return;
    navigator.clipboard.writeText(`${window.location.origin}/shared/${note.shareId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const toggleArchive = async () => {
    if (!note) return;
    try {
      const newArchived = !note.isArchived;
      await axios.patch(API.noteById(id), { isArchived: newArchived });
      setNote({ ...note, isArchived: newArchived });
    } catch {

    }
  };


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
        <p className="text-red-400/80 font-mono text-xs uppercase tracking-widest">Note not found.</p>
        <button onClick={() => router.push("/dashboard")} className="text-cyan-400 text-xs uppercase tracking-widest hover:underline">
          ← Back to notes
        </button>
      </div>
    );
  }

  const saveLabel = saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : saveStatus === "error" ? "Save failed" : "";
  const saveLabelColor = saveStatus === "error" ? "text-red-400" : "text-cyan-400/60";

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">

      <header className="flex items-center justify-between px-6 py-3 border-b border-cyan-900/30 bg-black sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-500 hover:text-cyan-400 transition-colors text-sm font-mono uppercase tracking-widest"
          >
            ←
          </button>
          <span className="text-gray-600 text-xs font-mono">/ notes /</span>
          <span className="text-gray-400 text-xs font-mono truncate max-w-50">{title || "Untitled"}</span>
        </div>

        <div className="flex items-center gap-3">
          {saveLabel && (
            <span className={`text-[10px] font-mono uppercase tracking-widest ${saveLabelColor}`}>
              {saveLabel}
            </span>
          )}

          <button
            onClick={toggleArchive}
            className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 border transition-colors ${
              note.isArchived
                ? "border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                : "border-cyan-900/30 text-gray-500 hover:text-gray-300"
            }`}
          >
            {note.isArchived ? "Unarchive" : "Archive"}
          </button>

          {note.isPublic ? (
            <div className="flex items-center gap-2">
              <button
                onClick={copyShareLink}
                className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={togglePublic}
                className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 border border-cyan-900/30 text-gray-500 hover:text-gray-300 transition-colors"
              >
                Make Private
              </button>
            </div>
          ) : (
            <button
              onClick={async () => { await togglePublic(); copyShareLink(); }}
              className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 border border-cyan-900/30 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            >
              Share
            </button>
          )}

          <button
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition-colors"
          >
            {aiPanelOpen ? "Hide AI" : "AI Summary"}
          </button>
        </div>
      </header>


      <div className="flex flex-1 overflow-hidden">

        <div className={`flex-1 overflow-y-auto px-8 py-10 ${aiPanelOpen ? "md:pr-8" : ""}`}>
          {note.isArchived && (
            <div className="mb-6 px-4 py-2 border border-yellow-500/30 bg-yellow-500/5 text-yellow-400 text-xs font-mono uppercase tracking-widest">
              This note is archived
            </div>
          )}


          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            rows={1}
            className="w-full bg-transparent text-3xl md:text-4xl font-bold text-cyan-500 placeholder-gray-700 resize-none outline-none border-none leading-tight mb-4 tracking-tight"
            style={{ minHeight: "52px" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = t.scrollHeight + "px";
            }}
          />


          <div className="flex flex-wrap items-center gap-2 mb-8">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 bg-cyan-950/30 border border-cyan-900/40 text-cyan-400 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest"
              >
                {t}
                <button onClick={() => removeTag(t)} className="hover:text-white ml-0.5 leading-none">×</button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="add tag..."
              className="bg-transparent text-[10px] font-mono uppercase tracking-widest text-gray-500 placeholder-gray-700 outline-none border-none w-24"
            />

            <span className="text-gray-700 text-xs mx-1">·</span>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-[10px] font-mono uppercase tracking-widest text-gray-500 outline-none border-none cursor-pointer"
            >
              <option value="" className="bg-black">No category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-black">{c}</option>
              ))}
            </select>
          </div>


          <div className="w-8 h-px bg-cyan-900/40 mb-8" />


          <textarea
            value={plainText}
            onChange={(e) => setPlainText(e.target.value)}
            placeholder="Start writing..."
            className="w-full bg-transparent text-gray-300 placeholder-gray-700 resize-none outline-none border-none leading-relaxed text-base min-h-100"
          />
        </div>


        {aiPanelOpen && (
          <aside className="hidden md:flex flex-col w-75 border-l border-cyan-900/30 bg-[#080808] overflow-y-auto">
            <div className="p-5 border-b border-cyan-900/30">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3">AI Summary</p>
              <button
                onClick={generateSummary}
                disabled={aiLoading}
                className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-black font-black text-[10px] uppercase tracking-widest transition-colors"
              >
                {aiLoading ? "Generating..." : "Generate Summary"}
              </button>
              {aiError && (
                <p className="text-red-400/70 text-[10px] font-mono mt-2">{aiError}</p>
              )}
              {note.aiGeneratedAt && (
                <p className="text-gray-600 text-[9px] font-mono mt-2 uppercase tracking-widest">
                  Last generated · {new Date(note.aiGeneratedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {aiSummary ? (
              <div className="p-5 flex flex-col gap-6">

                <div>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-gray-600 mb-2">Summary</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{aiSummary.summary}</p>
                </div>


                {aiSummary.actionItems?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-gray-600 mb-2">Action Items</p>
                    <ul className="flex flex-col gap-2">
                      {aiSummary.actionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-cyan-400 mt-0.5 shrink-0">□</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSummary.suggestedTitle && (
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-gray-600 mb-2">Suggested Title</p>
                    <p className="text-gray-300 text-sm italic mb-2">&quot;{aiSummary.suggestedTitle}&quot;</p>
                    <button
                      onClick={useSuggestedTitle}
                      className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Use this title →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !aiLoading && (
                <div className="flex-1 flex items-center justify-center p-5">
                  <p className="text-gray-700 text-[10px] font-mono uppercase tracking-widest text-center">
                    No summary yet.<br />Generate one above.
                  </p>
                </div>
              )
            )}

            {aiLoading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}