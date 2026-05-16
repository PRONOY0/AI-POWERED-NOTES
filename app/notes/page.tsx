"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API } from "@/lib/api";

export default function NewNotePage() {
    const router = useRouter();
    const [error, setError] = useState(false);

    useEffect(() => {
        const create = async () => {
            try {
                const res = await axios.post(API.notes, {
                    title: "Untitled",
                    plainText: "",
                    content: { type: "doc", content: [] },
                    tags: [],
                    category: null,
                    isArchived: false,
                    isPublic: false,
                });
                window.location.href = `/notes/${res.data.note.id}`;
            } catch {
                setError(true);
            }
        };

        create();
    }, []);

    if (error) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
                <p className="text-red-400/80 font-mono text-xs uppercase tracking-widest">
                    Failed to create note.
                </p>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="text-cyan-400 text-xs uppercase tracking-widest font-mono hover:underline"
                >
                    ← Back to notes
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
                <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest">
                    Creating note...
                </p>
            </div>
        </div>
    );
}