import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { User, ArrowRight } from "lucide-react";

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

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Intervenants</h1>
        <p className="mt-2 text-gray-500">
          {speakers.length} intervenant{speakers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {speakers.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <User size={48} className="mx-auto mb-4 opacity-30" />
          <p>Aucun intervenant enregistré.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {speakers.map((speaker) => (
            <Link key={speaker.id} href={`/speakers/${speaker.id}`}>
              <div className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4 mb-3">
                  {speaker.profilePhoto ? (
                    <img
                      src={speaker.profilePhoto}
                      alt={speaker.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <User size={20} className="text-blue-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {speaker.fullName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {speaker.sessions.length} session{speaker.sessions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{speaker.bio}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
