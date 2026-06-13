import { prisma } from "@/lib/prisma";
import { isSessionLive } from "@/lib/utils/date";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, MapPin, Users, User } from "lucide-react";
import { QASection } from "@/components/sessions/QASection";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const revalidate = 0;
type Props = { params: Promise<{ id: string; sessionId: string }> };

export default async function SessionDetailPage({ params }: Props) {
  const { id, sessionId } = await params;

  const session = await prisma.session.findFirst({
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
    <div className="space-y-8 max-w-3xl animate-fade-in">
      <Breadcrumb
        items={[
          { label: "Événements", href: "/events" },
          { label: session.event.title, href: `/events/${id}` },
          { label: session.title },
        ]}
      />

      {/* Header */}
      <div className="pb-6 border-b border-[var(--border)]">
        {isLive && (
          <div className="mb-4">
            <LiveBadge variant="banner" />
          </div>
        )}

        <h1 className="text-2xl font-bold text-[var(--text-primary)] leading-tight">
          {session.title}
        </h1>

        {session.description && (
          <p className="text-[var(--text-secondary)] mt-3 leading-relaxed">
            {session.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-[var(--text-tertiary)]">
          <span className="flex items-center gap-2">
            <Clock size={14} className="text-[var(--accent)]" />
            {format(new Date(session.startTime), "d MMM yyyy", { locale: fr })}
            {" · "}
            {format(new Date(session.startTime), "HH:mm")}
            {" → "}
            {format(new Date(session.endTime), "HH:mm")}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={14} className="text-[var(--accent)]" />
            {session.room.name}
          </span>
          {session.capacity && (
            <span className="flex items-center gap-2">
              <Users size={14} className="text-[var(--accent)]" />
              Capacité : {session.capacity}
            </span>
          )}
        </div>
      </div>

      {/* Intervenants */}
      {speakers.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
            Intervenants
          </h2>
          <div className="flex flex-wrap gap-3">
            {speakers.map((speaker) => (
              <Link key={speaker.id} href={`/speakers/${speaker.id}`}>
                <div className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] px-4 py-2.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)] transition-all group">
                  {speaker.profilePhoto ? (
                    <img
                      src={speaker.profilePhoto}
                      alt={speaker.fullName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
                      <User size={14} className="text-[var(--accent-text)]" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {speaker.fullName}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Q&A */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
        <QASection
          sessionId={session.id}
          initialQuestions={session.questions}
          isLive={isLive}
          startTime={session.startTime.toISOString()}
          endTime={session.endTime.toISOString()}
        />
      </div>
    </div>
  );
}