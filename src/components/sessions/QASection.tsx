"use client";

import { useState, useTransition } from "react";
import { MessageSquare, ThumbsUp, Send, Lock, User } from "lucide-react";
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

export function QASection({
  sessionId,
  initialQuestions,
  isLive,
  startTime,
  endTime,
}: Props) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

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
          body: JSON.stringify({
            content: content.trim(),
            authorName: authorName.trim() || null,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Impossible d'envoyer la question.");
          return;
        }

        setQuestions((prev) =>
          [data.data, ...prev].sort((a, b) => b.upvotes - a.upvotes)
        );
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
      prev
        .map((q) =>
          q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
        )
        .sort((a, b) => b.upvotes - a.upvotes)
    );

    try {
      await fetch(`/api/sessions/${sessionId}/questions/${questionId}/upvote`, {
        method: "POST",
      });
    } catch {
      // Rollback optimiste si erreur
      setUpvotedIds((prev) => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
      setQuestions((prev) =>
        prev
          .map((q) =>
            q.id === questionId ? { ...q, upvotes: q.upvotes - 1 } : q
          )
          .sort((a, b) => b.upvotes - a.upvotes)
      );
    }
  }

  return (
    <div>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-5">
        <MessageSquare size={18} className="text-blue-500" />
        Questions ({questions.length})
      </h2>

      {/* Formulaire */}
      {isLive ? (
        <form onSubmit={handleSubmit} className="mb-8 space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Posez votre question..."
              maxLength={1000}
              rows={3}
              className="w-full resize-none bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              required
            />

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <User
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Votre nom (optionnel)"
                  className="w-full pl-8 pr-3 py-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !content.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={14} />
                {isPending ? "Envoi..." : "Envoyer"}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                Question envoyée avec succès !
              </p>
            )}
          </div>
        </form>
      ) : (
        <div className="mb-8 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-500">
          <Lock size={16} className="text-gray-400 shrink-0" />
          <span>
            Les questions sont disponibles uniquement pendant la session.
            {new Date() < new Date(startTime) && (
              <>
                {" "}
                Elle commence le{" "}
                <strong>
                  {format(new Date(startTime), "d MMM à HH:mm", { locale: fr })}
                </strong>
                .
              </>
            )}
          </span>
        </div>
      )}

      {/* Liste des questions */}
      {questions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {isLive
              ? "Aucune question pour l'instant. Soyez le premier !"
              : "Aucune question posée lors de cette session."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={cn(
                "flex gap-4 bg-white border rounded-xl p-4 transition-all",
                index === 0 && questions[0].upvotes > 0
                  ? "border-blue-200 bg-blue-50/30"
                  : "border-gray-200"
              )}
            >
              {/* Upvote */}
              <button
                onClick={() => handleUpvote(question.id)}
                disabled={upvotedIds.has(question.id)}
                className={cn(
                  "flex flex-col items-center gap-1 shrink-0 transition-all",
                  upvotedIds.has(question.id)
                    ? "text-blue-600 cursor-default"
                    : "text-gray-300 hover:text-blue-500 cursor-pointer"
                )}
                title="Upvoter cette question"
              >
                <ThumbsUp
                  size={16}
                  fill={upvotedIds.has(question.id) ? "currentColor" : "none"}
                />
                <span className="text-xs font-bold">{question.upvotes}</span>
              </button>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{question.content}</p>
                <p className="text-xs text-gray-400 mt-1.5">
                  {question.authorName ? (
                    <span className="font-medium text-gray-500">
                      {question.authorName}
                    </span>
                  ) : (
                    <span className="italic">Anonyme</span>
                  )}
                  {" · "}
                  {format(new Date(question.createdAt), "HH:mm", {
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
