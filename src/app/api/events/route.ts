import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isNextResponse } from "@/lib/auth/requireOrganizer";
import { isSessionLive } from "@/lib/utils/date";

//GET /api/events PUBLIC

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            include: {
                sessions: {
                    include: {
                        room: true,
                        speakers: {
                            include: { speaker: true },
                        },
                    },
                },
            },
            orderBy: { startDate: "asc" },
        });

        const eventsWithLive = events.map((event: (typeof events)[number]) => ({
            ...event,
            sessions: event.sessions.map((session: (typeof event.sessions)[number]) => ({
                ...session,
                isLive: isSessionLive(session.startTime, session.endTime),
                speakers: session.speakers.map((ss: (typeof session.speakers)[number]) => ss.speaker),
            })),
        }));

        return NextResponse.json({ success: true, data: eventsWithLive });
    } catch (error) {
        console.error("[GET /api/events]", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur." },
            { status: 500 },
        );
    }
}

//POST /api/events ORGANISATEUR

export async function POST(request: NextRequest) {
    const auth = await requireOrganizer(request);
    if (isNextResponse(auth)) return auth;

    try {
        const body = await request.json().catch(() => null);
        if (!body) {
            return NextResponse.json(
                { success: false, error: "Requête invalide." },
                { status: 400 },
            );
        }

        const { title, description, startDate, endDate, location } = body as {
            title?: string;
            description?: string;
            startDate?: string;
            endDate?: string;
            location?: string;
        };

        if (
            !title?.trim() ||
            !description?.trim() ||
            !startDate ||
            !endDate ||
            !location?.trim()
        ) {
            return NextResponse.json(
                { success: false, error: "Tous les champs sont requis." },
                { status: 400 },
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json(
                { success: false, error: "Dates invalides." },
                { status: 400 },
            );
        }

        if (end <= start) {
            return NextResponse.json(
                {
                    success: false,
                    error: "La date de fin doit être après la date de début.",
                },
                { status: 400 },
            );
        }

        const event = await prisma.event.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                startDate: start,
                endDate: end,
                location: location.trim(),
                organizerId: auth.user.id,
            },
            include: { sessions: true },
        });

        return NextResponse.json(
            { success: true, data: event },
            { status: 201 },
        );
    } catch (error) {
        console.error("[POST /api/events]", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur." },
            { status: 500 },
        );
    }
}
