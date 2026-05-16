"use client";

import { usePathname } from "next/navigation";
import axios from "axios";
import { API } from "@/lib/api";
import Link from "next/link";

const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Analytics", href: "/insights" },
];

export default function Navbar() {
    const pathname = usePathname();

    const handleSignOut = async () => {
        try {
            await axios.post(API.auth.logout);
        } catch {
        } finally {
            window.location.href = "/";
        }
    };

    return (
        <nav className="sticky top-0 z-20 bg-black border-b border-cyan-900/30 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <Link href="/dashboard" className="text-cyan-400 font-mono text-sm font-bold tracking-widest uppercase">
                    ai-notes
                </Link>

                <div className="flex items-center gap-1">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 transition-colors ${pathname === link.href
                                    ? "text-cyan-400 bg-cyan-950/30 border border-cyan-900/40"
                                    : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleSignOut}
                    className="text-[10px] font-mono uppercase tracking-widest text-gray-400 hover:text-gray-300 transition-colors"
                >
                    Sign out
                </button>
            </div>
        </nav>
    );
}