import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/events
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ORGANIZER") {
        return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const events = await prisma.event.findMany({
        where: {
            organizerId: session.user.id,
        },
        include: {
            sessions: {
                include: {
                    room: true,
                    speakers: {
                        include: {
                            speaker: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            startDate: "asc",
        },
    });

    return NextResponse.json(events);
}

// POST /api/events
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ORGANIZER") {
        return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    if (!body) {
        return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
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
            { error: "Tous les champs sont requis." },
            { status: 400 }
        );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json({ error: "Dates invalides." }, { status: 400 });
    }

    if (end <= start) {
        return NextResponse.json(
            { error: "La date de fin doit être après la date de début." },
            { status: 400 }
        );
    }

    const event = await prisma.event.create({
        data: {
            title: title.trim(),
            description: description.trim(),
            startDate: start,
            endDate: end,
            location: location.trim(),
            organizerId: session.user.id,
        },
            include: {
            sessions: true,
        },
    });

    return NextResponse.json(event, { status: 201 });
}