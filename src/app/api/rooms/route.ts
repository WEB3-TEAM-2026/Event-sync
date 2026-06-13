import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isNextResponse } from "@/lib/auth/requireOrganizer";
import { roomSchema, validateBody } from "@/lib/validators";

//GET /api/rooms PUBLIC
export async function GET() {
    try {
        const rooms = await prisma.room.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: { select: { sessions: true } },
            },
        });

        return NextResponse.json(
            { success: true, data: rooms, count: rooms.length },
            {
                headers: {
                    "X-Total-Count": String(rooms.length),
                    "Access-Control-Expose-Headers": "X-Total-Count",
                },
            },
        );
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
        const res = await validateBody(request, roomSchema);
        if (res.error) return res.error;
        const { name } = res.data;

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