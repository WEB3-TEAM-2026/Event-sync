"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Star, Clock, MapPin, Radio, Trash2 } from "lucide-react";

interface Speaker {
  id: string;
  fullName: string;
}

interface Session {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isLive: boolean;
  room: { id: string; name: string };
  speakers: Speaker[];
  event: { id: string; title: string };
}

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("eventsync_favorites");
      const ids: string[] = stored ? JSON.parse(stored) : [];
      setFavoriteIds(ids);

      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      // Charger les sessions via l'API
      fetch("/api/sessions")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            const favSessions = data.data.filter((s: Session) =>
              ids.includes(s.id)
            );
            setSessions(favSessions);
          }
        })
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, []);

  function removeFavorite(sessionId: string) {
    const next = favoriteIds.filter((id) => id !== sessionId);
    setFavoriteIds(next);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    try {
      localStorage.setItem("eventsync_favorites", JSON.stringify(next));
    } catch {}
  }

  function clearAll() {
    setFavoriteIds([]);
    setSessions([]);
    try {
      localStorage.removeItem("eventsync_favorites");
    } catch {}
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-100 pb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <Star className="text-yellow-400" size={28} fill="currentColor" />
            Mes favoris
          </h1>
          <p className="mt-2 text-gray-500">
            {loading
              ? "Chargement..."
              : `${sessions.length} session${sessions.length !== 1 ? "s" : ""} sauvegardée${sessions.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {sessions.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            Tout effacer
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Star size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Aucune session en favori.</p>
          <p className="text-sm mt-2">
            Parcourez les événements et ajoutez des sessions avec l'étoile ★
          </p>
          <Link
            href="/events"
            className="inline-block mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Voir les événements
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="relative">
              <Link
                href={`/events/${session.event.id}/sessions/${session.id}`}
              >
                <div
                  className={`group border rounded-xl p-4 pr-12 transition-all hover:shadow-sm ${
                    session.isLive
                      ? "bg-red-50 border-red-200 hover:border-red-400"
                      : "bg-white border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {session.isLive && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                        <Radio size={8} />
                        LIVE
                      </span>
                    )}
                    <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 transition-colors">
                      {session.title}
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 font-medium mb-2">
                    {session.event.title}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {format(new Date(session.startTime), "d MMM · HH:mm", {
                        locale: fr,
                      })}{" "}
                      → {format(new Date(session.endTime), "HH:mm")}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {session.room.name}
                    </span>
                    {session.speakers.length > 0 && (
                      <span>
                        {session.speakers.map((s) => s.fullName).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <button
                onClick={() => removeFavorite(session.id)}
                className="absolute top-3 right-3 p-1.5 text-yellow-400 hover:text-red-400 transition-colors"
                title="Retirer des favoris"
              >
                <Star size={16} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
