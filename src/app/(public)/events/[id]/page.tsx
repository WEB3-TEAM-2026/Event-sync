import { prisma } from "@/lib/prisma";
import { isSessionLive } from "@/lib/utils/date";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MultiTrackPlanning } from "@/components/events/MultiTrackPlanning";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const revalidate = 30;
type Props = { params: Promise<{ id: string }> };

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      sessions: {
        include: { room: true, speakers: { include: { speaker: true } } },
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!event) notFound();

  const sessions = event.sessions.map((s) => ({
    ...s,
    isLive: isSessionLive(s.startTime, s.endTime),
    speakers: s.speakers.map((ss) => ss.speaker),
  }));

  const liveSessions = sessions.filter((s) => s.isLive);
  const rooms = Array.from(new Map(sessions.map((s) => [s.room.id, s.room])).values());

  return (
    <div className="space-y-8 animate-fade-in">
      <Breadcrumb
        items={[
          { label: "Événements", href: "/events" },
          { label: event.title },
        ]}
      />

      {/* Header */}
      <div className="pb-6 border-b border-[var(--border)]">
        <div className="flex items-start gap-3 mb-3 flex-wrap">
          {liveSessions.length > 0 && (
            <LiveBadge variant="pill" count={liveSessions.length} className="mt-1.5" />
          )}
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">{event.title}</h1>
        </div>
        <p className="text-[var(--text-secondary)] max-w-2xl">{event.description}</p>

        <div className="flex flex-wrap gap-5 mt-4 text-sm text-[var(--text-tertiary)]">
          <span className="flex items-center gap-2">
            <Calendar size={14} className="text-[var(--accent)]" />
            {format(new Date(event.startDate), "d MMMM yyyy", { locale: fr })}
            {" → "}
            {format(new Date(event.endDate), "d MMMM yyyy", { locale: fr })}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={14} className="text-[var(--accent)]" />
            {event.location}
          </span>
          <span className="flex items-center gap-2">
            <Clock size={14} className="text-[var(--accent)]" />
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-2">
            <Users size={14} className="text-[var(--accent)]" />
            {rooms.length} salle{rooms.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Sessions live */}
      {liveSessions.length > 0 && (
        <div className="rounded-[var(--radius-xl)] border border-red-500/20 bg-red-500/5 dark:bg-red-500/10 p-5">
          <h2 className="flex items-center gap-2.5 font-semibold text-[var(--text-primary)] mb-4">
            <LiveBadge variant="dot" />
            En ce moment
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {liveSessions.map((s) => (
              <Link key={s.id} href={`/events/${event.id}/sessions/${s.id}`}>
                <div className="bg-[var(--surface)] border border-red-500/20 rounded-[var(--radius-lg)] p-4 hover:border-red-500/40 hover:shadow-[var(--shadow-sm)] transition-all group">
                  <div className="flex items-center gap-2 mb-1">
                    <LiveBadge variant="pill" />
                    <p className="font-medium text-[var(--text-primary)] text-sm group-hover:text-[var(--accent)] transition-colors truncate">
                      {s.title}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">{s.room.name}</p>
                  {s.speakers.length > 0 && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                      {s.speakers.map((sp) => sp.fullName).join(", ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Planning */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Planning</h2>
        <MultiTrackPlanning sessions={sessions} eventId={event.id} rooms={rooms} />
      </div>
    </div>
  );
}