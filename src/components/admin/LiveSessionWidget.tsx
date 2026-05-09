import { PlayCircle, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface Session {
  id: string;
  title: string;
  room?: { name: string } | null;
}

export const LiveSessionWidget = ({ sessions }: { sessions: Session[] }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <PlayCircle className="text-red-500 animate-pulse" size={18} />
        Direct actuel
      </h3>
      <Badge color="red">{sessions.length}</Badge>
    </div>
    
    <div className="grid gap-3">
      {sessions.length > 0 ? (
        sessions.map((session) => (
          <div key={session.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="font-medium text-sm text-gray-900">{session.title}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <MapPin size={12} />
              {session.room?.name || "Salle non définie"}
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-400 italic text-center py-4">
          Aucune session en cours.
        </p>
      )}
    </div>
  </div>
);