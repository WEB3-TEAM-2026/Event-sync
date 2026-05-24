import { prisma } from "@/lib/prisma";
import { isSessionLive } from "@/lib/utils/date";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, MapPin, Users, ArrowLeft, Radio, User } from "lucide-react";
import { QASection } from "@/components/sessions/QASection";

export const revalidate = 0;

type Props = { params: Promise<{ id: string; sessionId: string }> };

export default async function SessionDetailPage({ params }: Props) {
  const { id, sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId, eventId: id },
    include: {
      event: true,
      room: true,
      speakers: { include: { speaker: true } },
      questions: { orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }] },
    },
  });

  if (!session) notFound();

  const isLive = isSessionLive(session.startTime, session.endTime);
  const speakers = session.speakers.map((ss) => ss.speaker);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Retour */}
      <Link
        href={`/events/${id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={15} />
        Retour à {session.event.title}
      </Link>

      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <div className="flex items-start gap-3 mb-2">
          {isLive && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold shrink-0 animate-pulse mt-1">
              <Radio size={10} />
              LIVE
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
        </div>

        <p className="text-gray-600 mt-3">{session.description}</p>

        <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <Clock size={14} className="text-blue-400" />
            {format(new Date(session.startTime), "d MMM yyyy", { locale: fr })}
            {" · "}
            {format(new Date(session.startTime), "HH:mm")} →{" "}
            {format(new Date(session.endTime), "HH:mm")}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={14} className="text-blue-400" />
            {session.room.name}
          </span>
          {session.capacity && (
            <span className="flex items-center gap-2">
              <Users size={14} className="text-blue-400" />
              Capacité : {session.capacity}
            </span>
          )}
        </div>
      </div>

      {/* Intervenants */}
      {speakers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Intervenants
          </h2>
          <div className="flex flex-wrap gap-4">
            {speakers.map((speaker) => (
              <Link key={speaker.id} href={`/speakers/${speaker.id}`}>
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all">
                  {speaker.profilePhoto ? (
                    <img
                      src={speaker.profilePhoto}
                      alt={speaker.fullName}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={16} className="text-blue-500" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-800">
                    {speaker.fullName}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Q&A */}
      <QASection
        sessionId={session.id}
        initialQuestions={session.questions}
        isLive={isLive}
        startTime={session.startTime.toISOString()}
        endTime={session.endTime.toISOString()}
      />
    </div>
  );
}
