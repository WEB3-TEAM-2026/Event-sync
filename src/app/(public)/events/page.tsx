import { prisma } from "@/lib/prisma";
import { isSessionLive } from "@/lib/utils/date";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const revalidate = 30;

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    include: {
      sessions: {
        include: { room: true, speakers: { include: { speaker: true } } },
      },
    },
    orderBy: { startDate: "asc" },
  });

  const eventsWithLive = events.map((event) => ({
    ...event,
    liveSessions: event.sessions.filter((s) => isSessionLive(s.startTime, s.endTime)),
  }));

  const totalLive = eventsWithLive.reduce((acc, e) => acc + e.liveSessions.length, 0);

  return (
    <div className="space-y-7 animate-fade-in">
      <Breadcrumb items={[{ label: "Événements" }]} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Événements</h1>
          <p className="mt-1.5 text-[var(--text-secondary)]">
            {events.length} événement{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        {totalLive > 0 && (
          <LiveBadge variant="pill" count={totalLive} className="mt-1 shrink-0" />
        )}
      </div>

      {/* Liste */}
      {eventsWithLive.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-tertiary)]">
          <Calendar size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-[var(--text-secondary)]">Aucun événement pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {eventsWithLive.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="group bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow)] hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                        {event.title}
                      </h2>
                      {event.liveSessions.length > 0 && (
                        <LiveBadge variant="pill" count={event.liveSessions.length} />
                      )}
                    </div>

                    <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-4">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-[var(--text-tertiary)]">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {format(new Date(event.startDate), "d MMM yyyy", { locale: fr })}
                        {" → "}
                        {format(new Date(event.endDate), "d MMM yyyy", { locale: fr })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {event.sessions.length} session{event.sessions.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0 mt-1"
                  />
                </div>

                {/* Sessions live en cours */}
                {event.liveSessions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <p className="text-xs text-[var(--text-tertiary)] font-medium mb-2">En ce moment :</p>
                    <div className="flex flex-wrap gap-2">
                      {event.liveSessions.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="px-2.5 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-full border border-red-500/20 font-medium"
                        >
                          {s.title}
                        </span>
                      ))}
                      {event.liveSessions.length > 3 && (
                        <span className="px-2.5 py-1 bg-[var(--surface-hover)] text-[var(--text-tertiary)] text-xs rounded-full border border-[var(--border)]">
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