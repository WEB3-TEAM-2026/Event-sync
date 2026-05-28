"use client";

import { useState, useTransition } from "react";
import { MessageSquare, ThumbsUp, Send, Lock, User, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";

interface Question {
  id: string;
  content: string;
  authorName: string | null;
  upvotes: number;
  createdAt: Date | string;
}

interface Props {
  sessionId: string;
  initialQuestions: Question[];
  isLive: boolean;
  startTime: string;
  endTime: string;
}

export function QASection({ sessionId, initialQuestions, isLive, startTime }: Props) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [content, setContent]     = useState("");
  const [authorName, setAuthorName] = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const [isPending, startTransition] = useTransition();
  const [upvotedIds, setUpvotedIds]  = useState<Set<string>>(new Set());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!content.trim()) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.trim(), authorName: authorName.trim() || null }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Impossible d'envoyer la question."); return; }
        setQuestions((prev) => [data.data, ...prev].sort((a, b) => b.upvotes - a.upvotes));
        setContent("");
        setAuthorName("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch {
        setError("Une erreur réseau est survenue.");
      }
    });
  }

  async function handleUpvote(questionId: string) {
    if (upvotedIds.has(questionId)) return;
    setUpvotedIds((prev) => new Set(prev).add(questionId));
    setQuestions((prev) =>
      prev.map((q) => q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q)
          .sort((a, b) => b.upvotes - a.upvotes)
    );
    try {
      await fetch(`/api/sessions/${sessionId}/questions/${questionId}/upvote`, { method: "POST" });
    } catch {
      setUpvotedIds((prev) => { const n = new Set(prev); n.delete(questionId); return n; });
      setQuestions((prev) =>
        prev.map((q) => q.id === questionId ? { ...q, upvotes: q.upvotes - 1 } : q)
            .sort((a, b) => b.upvotes - a.upvotes)
      );
    }
  }

  return (
    <section>
      {/* Header */}
      <h2 className="flex items-center gap-2.5 text-lg font-semibold text-[var(--text-primary)] mb-5">
        <span className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
          <MessageSquare size={15} className="text-[var(--accent)]" />
        </span>
        Questions
        <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]">
          {questions.length}
        </span>
      </h2>

      {/* Formulaire ou message verrouillé */}
      {isLive ? (
        <form onSubmit={handleSubmit} className="mb-7">
          <div className="rounded-[var(--radius-xl)] border border-[var(--accent)]/30 bg-[var(--accent-subtle)] p-4 space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Posez votre question à l'intervenant..."
              maxLength={1000}
              rows={3}
              className={cn(
                "w-full resize-none rounded-xl px-4 py-3 text-sm",
                "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]",
                "placeholder:text-[var(--text-tertiary)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]",
                "transition-all duration-150"
              )}
              required
            />
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Votre nom (optionnel)"
                  className={cn(
                    "w-full pl-8 pr-3 py-2.5 rounded-xl text-sm",
                    "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]",
                    "placeholder:text-[var(--text-tertiary)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]",
                    "transition-all"
                  )}
                />
              </div>
              <button
                type="submit"
                disabled={isPending || !content.trim()}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium",
                  "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]",
                  "disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                )}
              >
                <Send size={14} />
                {isPending ? "Envoi..." : "Envoyer"}
              </button>
            </div>

            {error && (
              <p className="text-sm text-[var(--live)] bg-[var(--live-subtle)] border border-[var(--live-border)] rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-[var(--success)] bg-[var(--success-subtle)] rounded-lg px-3 py-2">
                ✓ Question envoyée avec succès !
              </p>
            )}
          </div>
        </form>
      ) : (
        <div className="mb-7 flex items-center gap-3 bg-[var(--surface-hover)] border border-[var(--border)] rounded-[var(--radius-xl)] px-5 py-4 text-sm text-[var(--text-secondary)]">
          <Lock size={15} className="text-[var(--text-tertiary)] shrink-0" />
          <span>
            Les questions sont ouvertes uniquement pendant la session.
            {new Date() < new Date(startTime) && (
              <> Elle commence le{" "}
                <strong className="text-[var(--text-primary)]">
                  {format(new Date(startTime), "d MMM à HH:mm", { locale: fr })}
                </strong>.
              </>
            )}
          </span>
        </div>
      )}

      {/* Liste */}
      {questions.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-tertiary)]">
          <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {isLive ? "Aucune question pour l'instant — soyez le premier !" : "Aucune question posée."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={cn(
                "flex gap-3.5 rounded-[var(--radius-lg)] p-4 border transition-all duration-150",
                index === 0 && question.upvotes > 0
                  ? "bg-[var(--accent-subtle)] border-[var(--accent)]/25"
                  : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]"
              )}
            >
              {/* Upvote */}
              <button
                onClick={() => handleUpvote(question.id)}
                disabled={upvotedIds.has(question.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 shrink-0 px-2 py-1 rounded-lg border transition-all",
                  upvotedIds.has(question.id)
                    ? "border-[var(--accent)]/30 bg-[var(--accent-subtle)] text-[var(--accent-text)] cursor-default"
                    : "border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent-text)] hover:bg-[var(--accent-subtle)] cursor-pointer"
                )}
                title="Voter pour cette question"
              >
                <ChevronUp size={14} />
                <span className="text-xs font-bold leading-none">{question.upvotes}</span>
              </button>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">{question.content}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1.5 flex items-center gap-1.5">
                  {question.authorName
                    ? <span className="font-medium text-[var(--text-secondary)]">{question.authorName}</span>
                    : <span className="italic">Anonyme</span>}
                  <span>·</span>
                  {format(new Date(question.createdAt), "HH:mm", { locale: fr })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}