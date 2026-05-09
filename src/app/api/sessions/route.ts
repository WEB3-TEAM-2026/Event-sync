import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer } from "@/lib/auth/requireOrganizer";
import { isSessionLive } from "@/lib/utils/date";

// GET /api/sessions - PUBLIC
export async function GET() {
    try {
        const sessions = await prisma.session.findMany({
            include: {
                room: true,
                event: true,
                speakers: {
                    include: {
                        speaker: true,
                    },
                },
            },
            orderBy: { startTime: "asc" },
        });

        const sessionsWithLive = sessions.map((session: any) => ({
            ...session,
            isLive: isSessionLive(session.startTime, session.endTime),
            speakers: session.speakers.map((ss: any) => ss.speaker),
        }));

        return NextResponse.json({ success: true, data: sessionsWithLive });
    } catch (error) {
        console.error("[GET /api/sessions]", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur." },
            { status: 500 }
        );
    }
}

// POST /api/sessions - Créer une session (Organizer only)
export async function POST(req: Request) {
    try {
        const authResult = await requireOrganizer(req);
        if ("status" in authResult) {
            return authResult;
        }

        const { user } = authResult;
        const body = await req.json();
        const { title, description, startTime, endTime, eventId, roomId, speakerIds } = body;

        const newSession = await prisma.session.create({
            data: {
                title,
                description,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                eventId,
                roomId,
                speakers: {
                    create: speakerIds.map((speakerId: string) => ({ speakerId })),
                },
            },
        });

        return NextResponse.json(newSession, { status: 201 });
    } catch (error) {
        console.error("[POST /api/sessions]", error);
        return NextResponse.json(
            { error: "Failed to create session" },
            { status: 500 }
        );
    }
}