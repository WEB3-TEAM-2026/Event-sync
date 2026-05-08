import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function checkEventOwnership(
    eventId: string,
    organizerId: string,
): Promise<
    | { event: Awaited<ReturnType<typeof prisma.event.findUnique>> }
    | NextResponse
> {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
    });

    if (!event) {
        return NextResponse.json(
            { success: false, error: "Événement non trouvé." },
            { status: 404 },
        );
    }

    if (event.organizerId !== organizerId) {
        return NextResponse.json(
            {
                success: false,
                error: "Accès refusé. Vous n'êtes pas propriétaire de cet événement.",
            },
            { status: 403 },
        );
    }

    return { event };
}

export function isNextResponse(value: unknown): value is NextResponse {
    return value instanceof NextResponse;
}
