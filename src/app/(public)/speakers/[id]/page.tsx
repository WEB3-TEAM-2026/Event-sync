import { prisma } from "@/lib/prisma";
import { isSessionLive } from "@/lib/utils/date";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { User, Clock, MapPin, ExternalLink } from "lucide-react";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const revalidate = 60;
type Props = { params: Promise<{ id: string }> };

export default async function SpeakerDetailPage({ params }: Props) {
  const { id } = await params;

  const raw = await prisma.speaker.findUnique({
    where: { id },
    include: {
      sessions: {
        include: { session: { include: { event: true, room: true } } },
      },
    },
  });

  if (!raw) notFound();

  const sessions = raw.sessions.map((ss) => ({
    ...ss.session,
    isLive: isSessionLive(ss.session.startTime, ss.session.endTime),
  }));

  const externalLinks = raw.externalLinks as Record<string, string> | null;
  const liveSessions  = sessions.filter((s) => s.isLive);

  return (
    <div className="space-y-8 max-w-2xl animate-fade-in">
      <Breadcrumb
        items={[
          { label: "Intervenants", href: "/speakers" },
          { label: raw.fullName },
        ]}
      />

      {/* Profil */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
        <div className="flex items-start gap-5">
          {raw.profilePhoto ? (
            <img
              src={raw.profilePhoto}
              alt={raw.fullName}
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
              <User size={32} className="text-[var(--accent-text)]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{raw.fullName}</h1>
              {liveSessions.length > 0 && <LiveBadge variant="pill" count={liveSessions.length} />}
            </div>
            <p className="text-[var(--text-secondary)] mt-2 text-sm leading-relaxed">{raw.bio}</p>

            {externalLinks && Object.keys(externalLinks).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(externalLinks).map(([label, url]) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/50 hover:text-[var(--accent-text)] transition-all"
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
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
          Sessions <span className="text-[var(--text-tertiary)] font-normal">({sessions.length})</span>
        </h2>

        {sessions.length === 0 ? (
          <p className="text-[var(--text-tertiary)] text-sm">Aucune session assignée.</p>
        ) : (
          <div className="space-y-2.5">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/events/${session.eventId}/sessions/${session.id}`}
              >
                <div className={`group border rounded-[var(--radius-lg)] p-4 transition-all hover:shadow-[var(--shadow-sm)] ${
                  session.isLive
                    ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40 dark:bg-red-500/10"
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