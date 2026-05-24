"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, MapPin, Users, Radio, Star } from "lucide-react";
import { useFavorites } from "@/components/events/FavoritesContext";
import { cn } from "@/lib/utils/cn";

interface Speaker {
  id: string;
  fullName: string;
  profilePhoto?: string | null;
}

interface Room {
  id: string;
  name: string;
}

interface Session {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  capacity?: number | null;
  isLive: boolean;
  room: Room;
  speakers: Speaker[];
}

interface Props {
  sessions: Session[];
  rooms: Room[];
  eventId: string;
}

export function MultiTrackPlanning({ sessions, rooms, eventId }: Props) {
  const [activeRoom, setActiveRoom] = useState<string>("all");
  const { favorites, toggle } = useFavorites();

  const filtered =
    activeRoom === "all"
      ? sessions
      : sessions.filter((s) => s.room.id === activeRoom);

  const grouped = filtered.reduce<Record<string, Session[]>>((acc, session) => {
    const key = format(new Date(session.startTime), "HH:mm");
    if (!acc[key]) acc[key] = [];
    acc[key].push(session);
    return acc;
  }, {});

  const timeSlots = Object.keys(grouped).sort();

  return (
    <div className="space-y-5">
      {/* Filtres par salle */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveRoom("all")}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
            activeRoom === "all"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
          )}
        >
          Toutes les salles
        </button>
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setActiveRoom(room.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
              activeRoom === room.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            )}
          >
            {room.name}
          </button>
        ))}
      </div>

      {/* Légende favori */}
      <p className="text-xs text-gray-400 flex items-center gap-1.5">
        <Star size={12} className="text-yellow-400" fill="currentColor" />
        Cliquez sur l'étoile pour ajouter une session à vos favoris
      </p>

      {/* Grille temporelle */}
      {timeSlots.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune session pour cette salle.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {timeSlots.map((time) => (
            <div key={time} className="flex gap-4">
              {/* Heure */}
              <div className="w-16 shrink-0 pt-3">
                <span className="text-sm font-mono font-semibold text-blue-500">
                  {time}
                </span>
              </div>

              {/* Sessions en parallèle */}
              <div
                className={cn(
                  "flex-1 grid gap-3",
                  grouped[time].length === 1
                    ? "grid-cols-1"
                    : grouped[time].length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                )}
              >
                {grouped[time].map((session) => {
                  const isFav = favorites.includes(session.id);
                  return (
                    <div key={session.id} className="relative group">
                      <Link href={`/events/${eventId}/sessions/${session.id}`}>
                        <div
                          className={cn(
                            "border rounded-xl p-4 pr-10 transition-all duration-200 hover:shadow-md cursor-pointer",
                            session.isLive
                              ? "bg-red-50 border-red-200 hover:border-red-400"
                              : "bg-white border-gray-200 hover:border-blue-300"
                          )}
                        >
                          {/* Badge Live */}
                          {session.isLive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full mb-2 animate-pulse">
                              <Radio size={9} />
                              LIVE
                            </span>
                          )}

                          <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors line-clamp-2">
                            {session.title}
                          </h3>

                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Clock size={11} />
                              {format(new Date(session.startTime), "HH:mm")} →{" "}
                              {format(new Date(session.endTime), "HH:mm")}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <MapPin size={11} />
                              {session.room.name}
                              {session.capacity && (
                                <>
                                  {" · "}
                                  <Users size={10} />
                                  {session.capacity}
                                </>
                              )}
                            </div>
                            {session.speakers.length > 0 && (
                              <p className="text-xs text-blue-600 font-medium truncate">
                                {session.speakers
                                  .map((s) => s.fullName)
                                  .join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Bouton favori — toujours visible */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggle(session.id);
                        }}
                        className={cn(
                          "absolute top-3 right-3 p-1.5 rounded-full border transition-all z-10",
                          isFav
                            ? "bg-yellow-50 border-yellow-300 text-yellow-500 hover:bg-yellow-100"
                            : "bg-white border-gray-200 text-gray-300 hover:border-yellow-300 hover:text-yellow-400"
                        )}
                        title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <Star
                          size={13}
                          fill={isFav ? "currentColor" : "none"}
                        />
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
