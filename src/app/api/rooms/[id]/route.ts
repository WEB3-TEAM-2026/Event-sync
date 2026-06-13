import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isNextResponse } from "@/lib/auth/requireOrganizer";

// GET /api/rooms/[id] PUBLIC
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        sessions: {
          include: { event: true },
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ success: false, error: "Salle non trouvée." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: room });
  } catch (error) {
    console.error("[GET /api/rooms/:id]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

// PUT /api/rooms/[id] ORGANISATEUR
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrganizer(request);
  if (isNextResponse(auth)) return auth;

  const { id } = await params;

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Requête invalide." }, { status: 400 });
    }

    const { name } = body as { name?: string };

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: "Le nom est requis." }, { status: 400 });
    }

    const existing = await prisma.room.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Salle non trouvée." }, { status: 404 });
    }

    const updated = await prisma.room.update({ where: { id }, data: { name: name.trim() } });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/rooms/:id]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

// DELETE /api/rooms/[id] ORGANISATEUR
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrganizer(request);
  if (isNextResponse(auth)) return auth;

  const { id } = await params;

  try {
    const existing = await prisma.room.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Salle non trouvée." }, { status: 404 });
    }

    const sessionsCount = await prisma.session.count({ where: { roomId: id } });
    if (sessionsCount > 0) {
      return NextResponse.json(
        { success: false, error: `Impossible de supprimer : cette salle contient ${sessionsCount} session(s).` },
        { status: 409 }
      );
    }

    await prisma.room.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Salle supprimée." });
  } catch (error) {
    console.error("[DELETE /api/rooms/:id]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
