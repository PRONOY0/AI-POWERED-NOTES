import { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import axios from "axios";
import { API } from '@/lib/api';
import { toast } from 'react-toastify';
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();


    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        let response;

        try {
            response = isLogin
                ? await axios.post(API.auth.login, {
                    email,
                    password,
                })
                : await axios.post(API.auth.signup, {
                    name,
                    email,
                    password,
                });


            router.push("/dashboard");

            toast.success(response.data.message);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error);
            }
        }
    };

    return (
        <div className="min-h-screen w-full bg-black text-white font-sans flex flex-col md:flex-row overflow-hidden selection:bg-cyan-500/30">
            <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-16 border-b md:border-b-0 md:border-r border-cyan-950/50 bg-black min-h-screen md:min-h-0">
                <div className="space-y-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-400 flex items-center justify-center rounded-sm">
                            <div className="w-4 h-4 bg-black rotate-45"></div>
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-cyan-400 uppercase">AI.Notes</span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter text-white">
                            Intelligent<br />
                            <span className="text-cyan-400">Note-taking</span>.
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-sm">
                            Write your thoughts, we&apos;ll handle the summaries, titles, and organization. Professional AI integration for your workspace.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-cyan-950/20 border border-cyan-900/30 rounded flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                            <span className="text-[11px] font-mono text-cyan-400">AI ENGINE ONLINE</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-px bg-cyan-900/20 border border-cyan-900/30 mt-12 md:mt-0">
                    <div className="p-6 bg-black">
                        <div className="text-2xl font-mono text-cyan-400">1.2s</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">Avg Summary Time</div>
                    </div>
                    <div className="p-6 bg-black">
                        <div className="text-2xl font-mono text-cyan-400">99.9%</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">Accuracy Rating</div>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 bg-zinc-950 min-h-screen md:min-h-0">
                <div className="w-full max-w-sm space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white">
                            {isLogin ? 'Get Started' : 'Join the Platform'}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {isLogin ? 'Log in to your secure encrypted vault.' : 'Create an account to securely store your notes.'}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleAuth}>
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-cyan-800 uppercase tracking-widest">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-black border border-cyan-900/40 py-4 pl-12 pr-4 rounded-none focus:outline-none focus:border-cyan-400 text-sm text-cyan-50 transition-all placeholder:text-gray-700"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-cyan-800 uppercase tracking-widest">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="developer@domain.com"
                                    className="w-full bg-black border border-cyan-900/40 py-4 pl-12 pr-4 rounded-none focus:outline-none focus:border-cyan-400 text-sm text-cyan-50 transition-all placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-cyan-800 uppercase tracking-widest">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    placeholder="••••••••••••"
                                    className="w-full bg-black border border-cyan-900/40 py-4 pl-12 pr-4 rounded-none focus:outline-none focus:border-cyan-400 text-sm text-cyan-50 transition-all placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="group w-full bg-cyan-400 hover:bg-cyan-300 text-black font-black py-4 rounded-none text-sm transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                            {isLogin ? 'Authorize Access' : 'Initialize Account'}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="flex items-center gap-4">
                        <div className="h-px grow bg-cyan-950"></div>
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest">OR</span>
                        <div className="h-px grow bg-cyan-950"></div>
                    </div>

                    <div className="flex flex-col gap-4 text-center">
                        <p className="text-gray-500 text-sm">
                            {isLogin ? 'New to the platform? ' : 'Already integrated? '}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-cyan-400 font-bold ml-1 hover:underline outline-none"
                            >
                                {isLogin ? 'Create Account' : 'Authorize Access'}
                            </button>
                        </p>
                        <div className="pt-12 flex justify-between border-t border-cyan-900/10">
                            <span className="text-[10px] text-gray-700 uppercase">AES-256 Encryption</span>
                            <span className="text-[10px] text-gray-700 uppercase">Terms of Service</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
