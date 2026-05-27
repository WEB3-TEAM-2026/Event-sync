import { prisma } from "@/lib/prisma";
import { isSessionLive } from "@/lib/utils/date";
import Link from "next/link";
import { User, ArrowRight } from "lucide-react";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const revalidate = 60;

export default async function SpeakersPage() {
  const speakers = await prisma.speaker.findMany({
    orderBy: { fullName: "asc" },
    include: {
      sessions: {
        include: { session: { include: { event: true } } },
      },
    },
  });

  const speakersWithLive = speakers.map((sp) => ({
    ...sp,
    hasLiveSession: sp.sessions.some((ss) =>
      isSessionLive(ss.session.startTime, ss.session.endTime)
    ),
  }));

  return (
    <div className="space-y-7 animate-fade-in">
      <Breadcrumb items={[{ label: "Intervenants" }]} />

      <div className="pb-6 border-b border-[var(--border)]">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Intervenants</h1>
        <p className="mt-1.5 text-[var(--text-secondary)]">
          {speakers.length} intervenant{speakers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {speakers.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-tertiary)]">
          <User size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-[var(--text-secondary)]">Aucun intervenant enregistré.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {speakersWithLive.map((speaker) => (
            <Link key={speaker.id} href={`/speakers/${speaker.id}`}>
              <div className="group bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow)] hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  {speaker.profilePhoto ? (
                    <img
                      src={speaker.profilePhoto}
                      alt={speaker.fullName}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
                      <User size={18} className="text-[var(--accent-text)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                        {speaker.fullName}
                      </p>
                      {speaker.hasLiveSession && <LiveBadge variant="pill" />}
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      {speaker.sessions.length} session{speaker.sessions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ArrowRight size={15} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </div>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{speaker.bio}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}