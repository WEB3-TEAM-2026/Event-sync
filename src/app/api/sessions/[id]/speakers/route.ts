import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isNextResponse } from "@/lib/auth/requireOrganizer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function assertSessionExists(
  sessionId: string
): Promise<NextResponse | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true },
  });
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Session non trouvée" },
      { status: 404 }
    );
  }
  return null;
}

async function assertSpeakerExists(
  speakerId: string
): Promise<NextResponse | null> {
  const speaker = await prisma.speaker.findUnique({
    where: { id: speakerId },
    select: { id: true },
  });
  if (!speaker) {
    return NextResponse.json(
      { success: false, error: "Intervenant non trouvé" },
      { status: 404 }
    );
  }
  return null;
}

// ─── GET /api/sessions/[id]/speakers ─────────────────────────────────────────


export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notFound = await assertSessionExists(params.id);
    if (notFound) return notFound;

    const links = await prisma.sessionSpeaker.findMany({
      where: { sessionId: params.id },
      include: {
        speaker: true,
      },
      orderBy: {
        speaker: { fullName: "asc" },
      },
    });

    const speakers = links.map((l) => l.speaker);

    return NextResponse.json({
      success: true,
      data: speakers,
      count: speakers.length,
    });
  } catch (error) {
    console.error("[GET /api/sessions/:id/speakers]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// ─── POST /api/sessions/[id]/speakers ────────────────────────────────────────


export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireOrganizer(request);
  if (isNextResponse(auth)) return auth;

  try {
    let body: { speakerId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Corps de requête JSON invalide" },
        { status: 400 }
      );
    }

    const { speakerId } = body;
    if (!speakerId || typeof speakerId !== "string") {
      return NextResponse.json(
        { success: false, error: "speakerId est requis" },
        { status: 400 }
      );
    }

    const sessionNotFound = await assertSessionExists(params.id);
    if (sessionNotFound) return sessionNotFound;

    const speakerNotFound = await assertSpeakerExists(speakerId);
    if (speakerNotFound) return speakerNotFound;

    const link = await prisma.sessionSpeaker.upsert({
      where: {
        sessionId_speakerId: {   
          sessionId: params.id,
          speakerId,
        },
      },
      update: {},                
      create: {
        sessionId: params.id,
        speakerId,
      },
      include: { speaker: true },
    });

    return NextResponse.json(
      {
        success: true,
        data: link.speaker,
        message: "Intervenant attaché à la session",
      },
      { status: 200 }            
    );
  } catch (error) {
    console.error("[POST /api/sessions/:id/speakers]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/sessions/[id]/speakers ──────────────────────────────────────


export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireOrganizer(request);
  if (isNextResponse(auth)) return auth;

  try {
    let body: { speakerId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Corps de requête JSON invalide" },
        { status: 400 }
      );
    }

    const { speakerId } = body;
    if (!speakerId || typeof speakerId !== "string") {
      return NextResponse.json(
        { success: false, error: "speakerId est requis" },
        { status: 400 }
      );
    }

    const sessionNotFound = await assertSessionExists(params.id);
    if (sessionNotFound) return sessionNotFound;

    await prisma.sessionSpeaker.deleteMany({
      where: {
        sessionId: params.id,
        speakerId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Intervenant détaché de la session",
    });
  } catch (error) {
    console.error("[DELETE /api/sessions/:id/speakers]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
