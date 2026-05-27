"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Star, Clock, MapPin, Trash2, ArrowRight } from "lucide-react";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

interface Speaker { id: string; fullName: string; }
interface Session {
  id: string; title: string; description: string;
  startTime: string; endTime: string; isLive: boolean;
  room: { id: string; name: string };
  speakers: Speaker[];
  event: { id: string; title: string };
}

export default function FavoritesPage() {
  const initialFavoriteIds: string[] = (() => {
    try {
      const stored = localStorage.getItem("eventsync_favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })();

  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialFavoriteIds);
  const [sessions, setSessions]       = useState<Session[]>([]);
  const [loading, setLoading]         = useState<boolean>(initialFavoriteIds.length > 0);

  useEffect(() => {
    if (favoriteIds.length === 0) return;

    let isMounted = true;

    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          setSessions(data.data.filter((s: Session) => favoriteIds.includes(s.id)));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [favoriteIds]);

  function removeFavorite(sessionId: string) {
    const next = favoriteIds.filter((id) => id !== sessionId);
    setFavoriteIds(next);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    try { localStorage.setItem("eventsync_favorites", JSON.stringify(next)); } catch {}
  }

  function clearAll() {
    setFavoriteIds([]); setSessions([]);
    try { localStorage.removeItem("eventsync_favorites"); } catch {}
  }

  const liveSessions = sessions.filter((s) => s.isLive);

  return (
    <div className="space-y-7 animate-fade-in">
      <Breadcrumb items={[{ label: "Mes favoris" }]} />

      <div className="pb-6 border-b border-[var(--border)] flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-3xl font-bold text-[var(--text-primary)]">
            <Star className="text-yellow-400" size={26} fill="currentColor" />
            Mes favoris
          </h1>
          <p className="mt-1.5 text-[var(--text-secondary)]">
            {loading
              ? "Chargement..."
              : `${sessions.length} session${sessions.length !== 1 ? "s" : ""} sauvegardée${sessions.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {liveSessions.length > 0 && (
            <LiveBadge variant="pill" count={liveSessions.length} />
          )}
          {sessions.length > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-[var(--text-tertiary)] hover:text-red-500 transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              Tout effacer
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 skeleton" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[var(--surface-hover)] flex items-center justify-center mx-auto mb-5">
            <Star size={28} className="text-[var(--text-tertiary)] opacity-50" />
          </div>
          <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">Aucun favori pour l&apos;instant</p>
          <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
            Parcourez les événements et cliquez sur ★ pour sauvegarder vos sessions.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Voir les événements <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sessions.map((session) => (
            <div key={session.id} className="relative group">
              <Link href={`/events/${session.event.id}/sessions/${session.id}`}>
                <div className={`border rounded-[var(--radius-lg)] p-4 pr-12 transition-all hover:shadow-[var(--shadow-sm)] ${
                  session.isLive
                    ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                    : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]"
                }`}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {session.isLive && <LiveBadge variant="pill" />}
                    <p className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {session.title}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--accent-text)] font-medium mb-2">
                    {session.event.title}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {format(new Date(session.startTime), "d MMM · HH:mm", { locale: fr })}
                      {" → "}
                      {format(new Date(session.endTime), "HH:mm")}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {session.room.name}
                    </span>
                    {session.speakers.length > 0 && (
                      <span>{session.speakers.map((s) => s.fullName).join(", ")}</span>
                    )}
                  </div>
                </div>
              </Link>

              <button
                onClick={() => removeFavorite(session.id)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-yellow-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                title="Retirer des favoris"
              >
                <Star size={15} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}