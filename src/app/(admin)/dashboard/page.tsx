import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import { LiveSessionWidget } from "@/components/admin/LiveSessionWidget";
import { QuickActions } from "@/components/admin/QuickActions";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, Calendar, MessageSquare, PlayCircle } from "lucide-react";

export default async function Dashboard() {
  const now = new Date();
  
  const [stats, liveSessions] = await Promise.all([
    Promise.all([
      prisma.speaker.count(),
      prisma.event.count(),
      prisma.question.count(),
    ]),
    prisma.session.findMany({
      where: { startTime: { lte: now }, endTime: { gte: now } },
      include: { room: true }
    })
  ]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Intervenants" value={stats[0]} icon={Users} colorClass="bg-blue-100 text-blue-600" />
        <StatCard title="Événements" value={stats[1]} icon={Calendar} colorClass="bg-purple-100 text-purple-600" />
        <StatCard title="Questions" value={stats[2]} icon={MessageSquare} colorClass="bg-green-100 text-green-600" />
        <StatCard title="Live" value={liveSessions.length} icon={PlayCircle} colorClass="bg-red-100 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <LiveSessionWidget sessions={liveSessions} />
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}