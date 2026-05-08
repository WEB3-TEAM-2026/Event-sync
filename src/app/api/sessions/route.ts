import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSessionLive } from "@/lib/utils/date";

//GET /api/sessions PUBLIC

export async function GET() {
    try {
        const sessions = await prisma.session.findMany({
            include: {
                room: true,
                event: true,
                speakers: {
                    include: { speaker: true },
                },
            },
            orderBy: { startTime: "asc" },
        });

        const sessionsWithLive = sessions.map((session: (typeof sessions)[number]) => ({
            ...session,
            isLive: isSessionLive(session.startTime, session.endTime),
            speakers: session.speakers.map((ss: (typeof session.speakers)[number]) => ss.speaker),
        }));

        return NextResponse.json({ success: true, data: sessionsWithLive });
    } catch (error) {
        console.error("[GET /api/sessions]", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur." },
            { status: 500 },
        );
    }
}
