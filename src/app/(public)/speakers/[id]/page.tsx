import { prisma } from "@/lib/prisma";
import { isSessionLive } from "@/lib/utils/date";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { User, Clock, MapPin, ArrowLeft, Radio, ExternalLink } from "lucide-react";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export default async function SpeakerDetailPage({ params }: Props) {
  const { id } = await params;

  const raw = await prisma.speaker.findUnique({
    where: { id },
    include: {
      sessions: {
        include: {
          session: {
            include: { event: true, room: true },
          },
        },
      },
    },
  });

  if (!raw) notFound();

  const sessions = raw.sessions.map((ss) => ({
    ...ss.session,
    isLive: isSessionLive(ss.session.startTime, ss.session.endTime),
  }));

  const externalLinks = raw.externalLinks as Record<string, string> | null;

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Retour */}
      <Link
        href="/speakers"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={15} />
        Tous les intervenants
      </Link>

      {/* Profil */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start gap-5">
          {raw.profilePhoto ? (
            <img
              src={raw.profilePhoto}
              alt={raw.fullName}
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <User size={32} className="text-blue-500" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{raw.fullName}</h1>
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">{raw.bio}</p>

            {externalLinks && Object.keys(externalLinks).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(externalLinks).map(([label, url]) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                  >
                    <ExternalLink size={11} />
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Sessions ({sessions.length})
        </h2>

        {sessions.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune session assignée.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/events/${session.eventId}/sessions/${session.id}`}
              >
                <div
                  className={`group border rounded-xl p-4 transition-all hover:shadow-sm ${
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
                    <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 transition-colors truncate">
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
