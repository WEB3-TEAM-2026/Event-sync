import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isNextResponse } from "@/lib/auth/requireOrganizer";
import { speakerSchema, validateBody } from "@/lib/validators";

// ─── GET /api/speakers — PUBLIC ───────────────────────────────────────────────

export async function GET() {
    try {
        const speakers = await prisma.speaker.findMany({
            orderBy: { fullName: "asc" },
        });

        const total = speakers.length;

        return NextResponse.json(
            { success: true, data: speakers, count: total },
            {
                headers: {
                    "X-Total-Count": String(total),
                    "Access-Control-Expose-Headers": "X-Total-Count",
                },
            },
        );
    } catch (error) {
        console.error("[GET /api/speakers]", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur." },
            { status: 500 },
        );
    }
}

// ─── POST /api/speakers — ORGANISATEUR ───────────────────────────────────────

export async function POST(request: NextRequest) {
    const auth = await requireOrganizer(request);
    if (isNextResponse(auth)) return auth;

    try {
        const res = await validateBody(request, speakerSchema);
        if (res.error) return res.error;
        const { fullName, profilePhoto, bio, externalLinks } = res.data;

        const speaker = await prisma.speaker.create({
            data: {
                fullName: fullName.trim(),
                bio: bio.trim(),
                profilePhoto: profilePhoto ?? null,
                externalLinks: externalLinks ?? undefined,
            },
        });

        return NextResponse.json({ success: true, data: speaker }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/speakers]", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur." },
            { status: 500 },
        );
    }
}