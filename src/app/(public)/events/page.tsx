import { prisma } from "@/lib/prisma";
import { isSessionLive } from "@/lib/utils/date";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowRight, Radio } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const revalidate = 30;

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    include: {
      sessions: {
        include: {
          room: true,
          speakers: { include: { speaker: true } },
        },
      },
    },
    orderBy: { startDate: "asc" },
  });

  const eventsWithLive = events.map((event) => {
    const liveSessions = event.sessions.filter((s) =>
      isSessionLive(s.startTime, s.endTime)
    );
    return { ...event, liveSessions };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
        <p className="mt-2 text-gray-500">
          {events.length} événement{events.length !== 1 ? "s" : ""} disponible{events.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Events list */}
      {eventsWithLive.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Aucun événement pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {eventsWithLive.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {event.title}
                      </h2>
                      {event.liveSessions.length > 0 && (
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold shrink-0 animate-pulse">
                          <Radio size={10} />
                          LIVE
                        </span>
                      )}
                    </div>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {format(new Date(event.startDate), "d MMM yyyy", { locale: fr })}
                        {" → "}
                        {format(new Date(event.endDate), "d MMM yyyy", { locale: fr })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {event.sessions.length} session{event.sessions.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    size={20}
                    className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0 mt-1"
                  />
                </div>

                {event.liveSessions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium mb-2">En ce moment :</p>
                    <div className="flex flex-wrap gap-2">
                      {event.liveSessions.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="px-3 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-100"
                        >
                          {s.title}
                        </span>
                      ))}
                      {event.liveSessions.length > 3 && (
                        <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-100">
                          +{event.liveSessions.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
