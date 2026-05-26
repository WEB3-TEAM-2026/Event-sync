import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isNextResponse } from "@/lib/auth/requireOrganizer";

//GET /api/rooms PUBLIC
export async function GET() {
    try {
        const rooms = await prisma.room.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: { select: { sessions: true } },
            },
        });

        return NextResponse.json({
            success: true,
            data: rooms,
            count: rooms.length,
        });
    } catch (error) {
        console.error("[GET /api/rooms]", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur." },
            { status: 500 },
        );
    }
}

//POST /api/rooms ORGANISATEUR
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

        const { name } = body as { name?: string };

        if (!name?.trim()) {
            return NextResponse.json(
                { success: false, error: "Le nom de la salle est requis." },
                { status: 400 },
            );
        }

        const room = await prisma.room.create({
            data: { name: name.trim() },
        });

        return NextResponse.json(
            { success: true, data: room },
            { status: 201 },
        );
    } catch (error) {
        console.error("[POST /api/rooms]", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur." },
            { status: 500 },
        );
    }
}
