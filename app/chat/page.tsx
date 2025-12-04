// @ts-nocheck
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [tokensPerSecond, setTokensPerSecond] = useState<number | null>(null);

  // Vérifier que l'utilisateur est connecté
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push('/login');
      } else {
        setUserId(data.user.id);
      }
    };

    checkUser();
  }, [router]);

  const saveMessages = async (uid: string, msgs: Message[]) => {
    const userMessages = msgs.filter((m) => m.role === 'user');
    if (userMessages.length === 0) return;

    const rows = userMessages.map((m) => ({
      user_id: uid,
      role: m.role,
      content: m.content,
    }));

    await supabase.from('messages').insert(rows);
  };

  // 🔴 VERSION CORRIGÉE ICI 🔴
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!userId) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setTokenCount(null);
    setTokensPerSecond(null);

    const start = Date.now();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (err) {
        console.error('Erreur JSON /api/chat', err);
      }

      const replyText =
        data && typeof data.reply === 'string'
          ? data.reply
          : "Désolé, je n'ai pas pu générer de réponse (erreur API).";

      const assistantMessage: Message = {
        role: 'assistant',
        content: replyText,
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Calcul des tokens et tokens/s (approximation)
      const elapsedSec = (Date.now() - start) / 1000;
      const approxTokens = Math.round(assistantMessage.content.length / 4);

      setTokenCount(approxTokens);
      setTokensPerSecond(
        elapsedSec > 0 ? Number((approxTokens / elapsedSec).toFixed(1)) : null
      );

      await saveMessages(userId, finalMessages);
    } catch (err) {
      console.error('Erreur handleSubmit', err);
      alert("Le chatbot a rencontré une erreur.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isSendDisabled = isLoading || !input.trim();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">KS Chatbot · Gemini</h1>
        <button
          onClick={handleLogout}
          className="text-xs px-3 py-1.5 rounded-full border border-slate-700 hover:bg-slate-800 transition"
        >
          Déconnexion
        </button>
      </header>

      {/* Zone de chat */}
      <main className="flex-1 flex justify-center px-2">
        <div className="w-full max-w-2xl flex flex-col">
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 text-sm mt-10">
                Pose ta première question pour commencer la discussion 🤖
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-indigo-500 text-white rounded-br-sm'
                      : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Infos perf / tokens */}
          <div className="h-8 flex items-center justify-between text-xs text-slate-400 mb-1">
            <div>
              {isLoading && (
                <span className="animate-pulse">Le bot réfléchit...</span>
              )}
            </div>
            <div className="flex gap-3">
              {tokenCount !== null && <span>≈ {tokenCount} tokens</span>}
              {tokensPerSecond !== null && (
                <span>≈ {tokensPerSecond} tokens/s</span>
              )}
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border border-slate-800 rounded-2xl bg-slate-900/80 p-2 flex items-center gap-2 mb-4"
          >
            <textarea
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm px-2 py-1 max-h-32 text-slate-100 placeholder-slate-400"
              placeholder="Écris ton message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={isSendDisabled}
              className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Envoyer
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
