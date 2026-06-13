import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isNextResponse } from "@/lib/auth/requireOrganizer";
import { checkEventOwnership, isNextResponse as isNR } from "@/lib/auth/checkEventOwnership";
import { isSessionLive } from "@/lib/utils/date";

// GET /api/events/[id] PUBLIC

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const raw = await prisma.event.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            room: true,
            speakers: { include: { speaker: true } },
          },
        },
      },
    });

    if (!raw) {
      return NextResponse.json(
        { success: false, error: "Événement non trouvé." },
        { status: 404 }
      );
    }

    const event = {
      ...raw,
      sessions: raw.sessions.map((session: (typeof raw.sessions)[number]) => ({
        ...session,
        isLive: isSessionLive(session.startTime, session.endTime),
        speakers: session.speakers.map((ss: (typeof session.speakers)[number]) => ss.speaker),
      })),
    };

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("[GET /api/events/:id]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

// PUT /api/events/[id] ORGANISATEUR + OWNERSHIP

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrganizer(request);
  if (isNextResponse(auth)) return auth;

  const { id } = await params;
  const ownership = await checkEventOwnership(id, auth.user.id);
  if (isNR(ownership)) return ownership;

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Requête invalide." }, { status: 400 });
    }

    const { title, description, startDate, endDate, location } = body as {
      title?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      location?: string;
    };

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    if (start && isNaN(start.getTime())) {
      return NextResponse.json({ success: false, error: "Date de début invalide." }, { status: 400 });
    }
    if (end && isNaN(end.getTime())) {
      return NextResponse.json({ success: false, error: "Date de fin invalide." }, { status: 400 });
    }

    const effectiveStart = start ?? ownership.event!.startDate;
    const effectiveEnd = end ?? ownership.event!.endDate;

    if (effectiveEnd <= effectiveStart) {
      return NextResponse.json(
        { success: false, error: "La date de fin doit être après la date de début." },
        { status: 400 }
      );
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(start !== undefined && { startDate: start }),
        ...(end !== undefined && { endDate: end }),
        ...(location !== undefined && { location: location.trim() }),
      },
      include: { sessions: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/events/:id]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

// DELETE /api/events/[id] ORGANISATEUR + OWNERSHIP

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrganizer(request);
  if (isNextResponse(auth)) return auth;

  const { id } = await params;
  const ownership = await checkEventOwnership(id, auth.user.id);
  if (isNR(ownership)) return ownership;

  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Événement supprimé." });
  } catch (error) {
    console.error("[DELETE /api/events/:id]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
