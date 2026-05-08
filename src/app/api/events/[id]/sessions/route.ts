import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isNextResponse } from "@/lib/auth/requireOrganizer";
import {
    checkEventOwnership,
    isNextResponse as isNR,
} from "@/lib/auth/checkEventOwnership";
import { isSessionLive } from "@/lib/utils/date";

type Params = { params: { id: string } };

// ─── GET /api/events/[id]/sessions — PUBLIC (filtre roomId optionnel) ─────────

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const event = await prisma.event.findUnique({
            where: { id: params.id },
            select: { id: true },
        });

        if (!event) {
            return NextResponse.json(
                { success: false, error: "Événement non trouvé." },
                { status: 404 },
            );
        }

        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get("roomId") ?? undefined;

        const sessions = await prisma.session.findMany({
            where: {
                eventId: params.id,
                ...(roomId ? { roomId } : {}),
            },
            include: {
                room: true,
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

        return NextResponse.json({
            success: true,
            data: sessionsWithLive,
            meta: {
                count: sessionsWithLive.length,
                eventId: params.id,
                ...(roomId ? { roomId } : {}),
            },
        });
    } catch (error) {
        console.error("[GET /api/events/:id/sessions]", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur." },
            { status: 500 },
        );
    }
}

// ─── POST /api/events/[id]/sessions — ORGANISATEUR + OWNERSHIP ───────────────

export async function POST(request: NextRequest, { params }: Params) {
    const auth = await requireOrganizer(request);
    if (isNextResponse(auth)) return auth;

    const ownership = await checkEventOwnership(params.id, auth.user.id);
    if (isNR(ownership)) return ownership;

    try {
        const body = await request.json().catch(() => null);
        if (!body) {
            return NextResponse.json(
                { success: false, error: "Requête invalide." },
                { status: 400 },
            );
        }

        const { title, description, startTime, endTime, roomId, capacity } =
            body as {
                title?: string;
                description?: string;
                startTime?: string;
                endTime?: string;
                roomId?: string;
                capacity?: number;
            };

        if (
            !title?.trim() ||
            !description?.trim() ||
            !startTime ||
            !endTime ||
            !roomId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "title, description, startTime, endTime et roomId sont requis.",
                },
                { status: 400 },
            );
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json(
                { success: false, error: "Horaires invalides." },
                { status: 400 },
            );
        }

        if (end <= start) {
            return NextResponse.json(
                {
                    success: false,
                    error: "L'heure de fin doit être après l'heure de début.",
                },
                { status: 400 },
            );
        }

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            select: { id: true },
        });
        if (!room) {
            return NextResponse.json(
                { success: false, error: "Salle non trouvée." },
                { status: 404 },
            );
        }

        const session = await prisma.session.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                startTime: start,
                endTime: end,
                eventId: params.id,
                roomId,
                ...(capacity !== undefined && { capacity }),
            },
            include: {
                room: true,
                speakers: { include: { speaker: true } },
            },
        });

        const sessionWithLive = {
            ...session,
            isLive: isSessionLive(session.startTime, session.endTime),
            speakers: session.speakers.map((ss: (typeof session.speakers)[number]) => ss.speaker),
        };

        return NextResponse.json(
            { success: true, data: sessionWithLive },
            { status: 201 },
        );
    } catch (error) {
        console.error("[POST /api/events/:id/sessions]", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur." },
            { status: 500 },
        );
    }
}
