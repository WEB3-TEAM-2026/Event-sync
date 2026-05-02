import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/speakers/[id] - Détails d'un intervenant
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const speaker = await prisma.speaker.findUnique({
      where: { id: params.id },
      include: {
        sessions: {
          include: {
            session: {
              include: {
                event: true,
                room: true,
              },
            },
          },
        },
      },
    });

    if (!speaker) {
      return NextResponse.json({ success: false, error: "Intervenant non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: speaker });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * PUT /api/speakers/[id] - Mise à jour
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { fullName, profilePhoto, bio, externalLinks } = body;

    const updatedSpeaker = await prisma.speaker.update({
      where: { id: params.id },
      data: {
        fullName,
        profilePhoto,
        bio,
        externalLinks,
      },
    });

    return NextResponse.json({ success: true, data: updatedSpeaker });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

/**
 * DELETE /api/speakers/[id] - Suppression sécurisée
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionsCount = await prisma.sessionSpeaker.count({
      where: { speakerId: params.id },
    });

    if (sessionsCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Impossible de supprimer : cet intervenant est lié à des sessions actives." 
        }, 
        { status: 400 }
      );
    }

    await prisma.speaker.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Intervenant supprimé" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erreur lors de la suppression" }, { status: 500 });
  }
}