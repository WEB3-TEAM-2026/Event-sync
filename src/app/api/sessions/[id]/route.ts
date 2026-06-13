import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isNextResponse } from "@/lib/auth/requireOrganizer";
import { isSessionLive } from "@/lib/utils/date";

// GET /api/sessions/[id] PUBLIC

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const raw = await prisma.session.findUnique({
      where: { id },
      include: {
        room: true,
        event: true,
        speakers: { include: { speaker: true } },
        questions: {
          orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!raw) {
      return NextResponse.json(
        { success: false, error: "Session non trouvée." },
        { status: 404 }
      );
    }

    const data = {
      ...raw,
      isLive: isSessionLive(raw.startTime, raw.endTime),
      speakers: raw.speakers.map((ss: typeof raw.speakers[number]) => ss.speaker),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/sessions/:id]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}

// PUT /api/sessions/[id] ORGANISATEUR

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrganizer(request);
  if (isNextResponse(auth)) return auth;

  const { id } = await params;

  try {
    const existing = await prisma.session.findUnique({
      where: { id },
      select: { id: true, startTime: true, endTime: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Session non trouvée." },
        { status: 404 }
      );
    }

    const { validateBody, sessionUpdateSchema } = await import("@/lib/validators");
    const res = await validateBody(request, sessionUpdateSchema);
    if (res.error) return res.error;
    const { title, description, startTime, endTime, roomId, capacity, speakerIds } = res.data as {
      title?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      roomId?: string;
      capacity?: number;
      speakerIds?: string[];
    };

    const start = startTime ? new Date(startTime) : undefined;
    const end = endTime ? new Date(endTime) : undefined;

    const effectiveStart = start ?? existing.startTime;
    const effectiveEnd = end ?? existing.endTime;

    if (effectiveEnd <= effectiveStart) {
      return NextResponse.json(
        { success: false, error: "L'heure de fin doit être après l'heure de début." },
        { status: 400 }
      );
    }

    if (roomId) {
      const room = await prisma.room.findUnique({ where: { id: roomId }, select: { id: true } });
      if (!room) {
        return NextResponse.json(
          { success: false, error: "Salle non trouvée." },
          { status: 404 }
        );
      }
    }

    const speakersUpdate = Array.isArray(speakerIds)
      ? { speakers: { deleteMany: {}, create: speakerIds.map((speakerId: string) => ({ speakerId })) } }
      : {};

    const session = await prisma.session.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(start !== undefined && { startTime: start }),
        ...(end !== undefined && { endTime: end }),
        ...(roomId !== undefined && { roomId }),
        ...(capacity !== undefined && { capacity }),
        ...speakersUpdate,
      },
      include: {
        room: true,
        event: true,
        speakers: { include: { speaker: true } },
      },
    });

    const data = {
      ...session,
      isLive: isSessionLive(session.startTime, session.endTime),
      speakers: session.speakers.map((ss: typeof session.speakers[number]) => ss.speaker),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[PUT /api/sessions/:id]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id] ORGANISATEUR

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrganizer(request);
  if (isNextResponse(auth)) return auth;

  const { id } = await params;

  try {
    const existing = await prisma.session.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Session non trouvée." },
        { status: 404 }
      );
    }

    await prisma.session.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Session supprimée." });
  } catch (error) {
    console.error("[DELETE /api/sessions/:id]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
