import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isNextResponse } from "@/lib/auth/requireOrganizer";
import { isSessionLive } from "@/lib/utils/date";

//GET /api/sessions PUBLIC

export async function GET() {
    try {
        const sessions = await prisma.session.findMany({
            include: {
                room: true,
                event: true,
                speakers: { include: { speaker: true } },
                questions: {                              
                    orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
                },
            },
            orderBy: { startTime: "asc" },
        });

        const total = sessions.length;

        const data = sessions.map((session: typeof sessions[number]) => ({
            ...session,
            isLive: isSessionLive(session.startTime, session.endTime),
            speakers: session.speakers.map((ss: typeof session.speakers[number]) => ss.speaker),
        }));

        return NextResponse.json(
            { success: true, data, count: total },
            {
                headers: {
                    "X-Total-Count": String(total),
                    "Access-Control-Expose-Headers": "X-Total-Count",
                },
            },
        );
    } catch (error) {
        console.error("[GET /api/sessions]", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur." },
            { status: 500 },
        );
    }
}

// POST /api/sessions — ORGANISATEUR

export async function POST(request: NextRequest) {
    const auth = await requireOrganizer(request);
    if (isNextResponse(auth)) return auth;

    try {
const { sessionCreateSchema, validateBody } = await import("@/lib/validators");
    const res = await validateBody(request, sessionCreateSchema);
    if (res.error) return res.error;

    const { title, description, startTime, endTime, eventId, roomId, capacity, speakerIds } = res.data as {
      title: string;
      description?: string;
      startTime: string;
      endTime: string;
      eventId: string;
      roomId: string;
      capacity?: number;
      speakerIds?: string[];
    };

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return NextResponse.json(
        { success: false, error: "L'heure de fin doit être après l'heure de début." },
        { status: 400 },
      );
    }

        const [event, room] = await Promise.all([
            prisma.event.findUnique({ where: { id: eventId }, select: { id: true } }),
            prisma.room.findUnique({ where: { id: roomId }, select: { id: true } }),
        ]);

        if (!event) {
            return NextResponse.json(
                { success: false, error: "Événement non trouvé." },
                { status: 404 },
            );
        }
        if (!room) {
            return NextResponse.json(
                { success: false, error: "Salle non trouvée." },
                { status: 404 },
            );
        }

        const ids = Array.isArray(speakerIds) ? speakerIds : [];

        const session = await prisma.session.create({
            data: {
                title: title.trim(),
                description: description?.trim() ?? "",
                startTime: start,
                endTime: end,
                eventId,
                roomId,
                ...(capacity !== undefined && { capacity }),
                ...(ids.length > 0 && {
                    speakers: {
                        create: ids.map((speakerId: string) => ({ speakerId })),
                    },
                }),
            },
            include: {
                room: true,
                event: true,
                speakers: { include: { speaker: true } },
                questions: true,                          // ← AJOUTÉ
            },
        });

        const data = {
            ...session,
            isLive: isSessionLive(session.startTime, session.endTime),
            speakers: session.speakers.map((ss) => ss.speaker),
        };

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/sessions]", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur." },
            { status: 500 },
        );
    }
}
