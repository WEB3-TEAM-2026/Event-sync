import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isNextResponse } from "@/lib/auth/requireOrganizer";


export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const raw = await prisma.speaker.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            session: {
              include: { event: true, room: true },
            },
          },
        },
      },
    });

    if (!raw) {
      return NextResponse.json({ success: false, error: "Intervenant non trouvé" }, { status: 404 });
    }

    const speaker = { ...raw, sessions: raw.sessions.map((ss) => ss.session) };

    return NextResponse.json({ success: true, data: speaker });
  } catch (error) {
    console.error("[GET /api/speakers/:id]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

// ─── PUT /api/speakers/[id] ───────────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrganizer(request);
  if (isNextResponse(auth)) return auth;

  const { id } = await params;

  try {
    const existing = await prisma.speaker.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Intervenant non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { fullName, profilePhoto, bio, externalLinks } = body;

    if (!fullName && !bio && profilePhoto === undefined && externalLinks === undefined) {
      return NextResponse.json(
        { success: false, error: "Aucun champ à mettre à jour fourni" },
        { status: 400 }
      );
    }

    const updatedSpeaker = await prisma.speaker.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(profilePhoto !== undefined && { profilePhoto }),
        ...(bio !== undefined && { bio }),
        ...(externalLinks !== undefined && { externalLinks }),
      },
    });

    return NextResponse.json({ success: true, data: updatedSpeaker });
  } catch (error) {
    console.error("[PUT /api/speakers/:id]", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// ─── DELETE /api/speakers/[id] ────────────────────────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrganizer(request);
  if (isNextResponse(auth)) return auth;

  const { id } = await params;

  try {
    const existing = await prisma.speaker.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Intervenant non trouvé" }, { status: 404 });
    }

    const sessionsCount = await prisma.sessionSpeaker.count({ where: { speakerId: id } });

    if (sessionsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Impossible de supprimer : cet intervenant est lié à ${sessionsCount} session(s) active(s).`,
        },
        { status: 409 }
      );
    }

    await prisma.speaker.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Intervenant supprimé" });
  } catch (error) {
    console.error("[DELETE /api/speakers/:id]", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
