"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, MapPin, Users, Star } from "lucide-react";
import { useFavorites } from "@/components/events/FavoritesContext";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

interface Speaker { id: string; fullName: string; profilePhoto?: string | null; }
interface Room    { id: string; name: string; }
interface Session {
  id: string; title: string; description: string;
  startTime: Date; endTime: Date; capacity?: number | null;
  isLive: boolean; room: Room; speakers: Speaker[];
}
interface Props { sessions: Session[]; rooms: Room[]; eventId: string; }

export function MultiTrackPlanning({ sessions, rooms, eventId }: Props) {
  const [activeRoom, setActiveRoom] = useState<string>("all");
  const { favorites, toggle } = useFavorites();

  const filtered = activeRoom === "all" ? sessions : sessions.filter((s) => s.room.id === activeRoom);
  const grouped  = filtered.reduce<Record<string, Session[]>>((acc, s) => {
    const key = format(new Date(s.startTime), "HH:mm");
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});
  const timeSlots = Object.keys(grouped).sort();

  return (
    <div className="space-y-5">
      {/* Filtres salle */}
      <div className="flex flex-wrap gap-2">
        {[{ id: "all", name: "Toutes les salles" }, ...rooms].map((room) => (
          <button
            key={room.id}
            onClick={() => setActiveRoom(room.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
              activeRoom === room.id
                ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]/50 hover:text-[var(--text-primary)]"
            )}
          >
            {room.name}
          </button>
        ))}
      </div>

      {/* Grille */}
      {timeSlots.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-tertiary)]">
          <Clock size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune session pour cette salle.</p>
        </div>
      ) : (
        <div className="space-y-px rounded-[var(--radius-xl)] border border-[var(--border)] overflow-hidden bg-[var(--border)]">
          {timeSlots.map((time, ti) => (
            <div key={time} className="flex bg-[var(--background)]">
              {/* Heure */}
              <div className="w-16 shrink-0 flex flex-col items-center justify-start pt-4 pb-4 bg-[var(--surface)] border-r border-[var(--border)]">
                <span className="text-xs font-mono font-bold text-[var(--accent)]">{time}</span>
              </div>

              {/* Sessions */}
              <div
                className={cn(
                  "flex-1 p-2 grid gap-2",
                  grouped[time].length === 1 ? "grid-cols-1"
                  : grouped[time].length === 2 ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                )}
              >
                {grouped[time].map((session) => {
                  const isFav = favorites.includes(session.id);
                  return (
                    <div key={session.id} className="relative group">
                      <Link href={`/events/${eventId}/sessions/${session.id}`}>
                        <div className={cn(
                          "rounded-[var(--radius)] p-3.5 pr-9 border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow)]",
                          session.isLive
                            ? "bg-[var(--live-subtle)] border-[var(--live-border)] hover:border-[var(--live)]"
                            : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]"
                        )}>
                          {session.isLive && (
                            <Badge color="red" live className="mb-2">LIVE</Badge>
                          )}
                          <h3 className="font-semibold text-[var(--text-primary)] text-sm line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                            {session.title}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                              <Clock size={10} />
                              {format(new Date(session.startTime), "HH:mm")} → {format(new Date(session.endTime), "HH:mm")}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                              <MapPin size={10} />
                              {session.room.name}
                              {session.capacity && <><Users size={9} className="ml-1" />{session.capacity}</>}
                            </div>
                            {session.speakers.length > 0 && (
                              <p className="text-xs text-[var(--accent-text)] font-medium truncate">
                                {session.speakers.map((s) => s.fullName).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                      {/* Favori */}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(session.id); }}
                        className={cn(
                          "absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg border transition-all z-10",
                          isFav
                            ? "bg-yellow-50 border-yellow-300 text-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-700"
                            : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 hover:border-yellow-300 hover:text-yellow-400"
                        )}
                        title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <Star size={11} fill={isFav ? "currentColor" : "none"} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}