import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eventSchema, validateBody } from "@/lib/validators";
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

        return NextResponse.json(
            { success: true, data: eventsWithLive, count: eventsWithLive.length },
            {
                headers: {
                    "X-Total-Count": String(eventsWithLive.length),
                    "Access-Control-Expose-Headers": "X-Total-Count",
                },
            },
        );
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
        const res = await validateBody(request, eventSchema);
        if (res.error) return res.error;
        const { title, description, startDate, endDate, location } = res.data;

        const start = new Date(startDate);
        const end = new Date(endDate);

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