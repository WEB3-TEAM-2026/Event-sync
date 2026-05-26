import { prisma } from "@/lib/prisma";
import { isSessionLive } from "@/lib/utils/date";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Clock, Users, Radio } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MultiTrackPlanning } from "@/components/events/MultiTrackPlanning";

export const revalidate = 30;

type Props = { params: Promise<{ id: string }> };

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      sessions: {
        include: {
          room: true,
          speakers: { include: { speaker: true } },
        },
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

  const rooms = Array.from(
    new Map(sessions.map((s) => [s.room.id, s.room])).values()
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              {liveSessions.length > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-sm font-semibold animate-pulse">
                  <Radio size={12} />
                  {liveSessions.length} LIVE
                </span>
              )}
            </div>
            <p className="text-gray-600 max-w-2xl">{event.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <Calendar size={15} className="text-blue-400" />
            {format(new Date(event.startDate), "d MMMM yyyy", { locale: fr })}
            {" → "}
            {format(new Date(event.endDate), "d MMMM yyyy", { locale: fr })}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={15} className="text-blue-400" />
            {event.location}
          </span>
          <span className="flex items-center gap-2">
            <Clock size={15} className="text-blue-400" />
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-2">
            <Users size={15} className="text-blue-400" />
            {rooms.length} salle{rooms.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Sessions live en cours */}
      {liveSessions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <h2 className="flex items-center gap-2 font-semibold text-red-700 mb-3">
            <Radio size={16} className="animate-pulse" />
            En ce moment
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {liveSessions.map((s) => (
              <Link key={s.id} href={`/events/${event.id}/sessions/${s.id}`}>
                <div className="bg-white border border-red-200 rounded-xl p-4 hover:border-red-400 hover:shadow-sm transition-all">
                  <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.room.name}</p>
                  {s.speakers.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {s.speakers.map((sp) => sp.fullName).join(", ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Planning multi-track */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Planning</h2>
        <MultiTrackPlanning sessions={sessions} eventId={event.id} rooms={rooms} />
      </div>
    </div>
  );
}
