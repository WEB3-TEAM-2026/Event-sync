import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Event, Room, Session, SessionSpeaker, Speaker as PrismaSpeaker } from "@prisma/client";

type SpeakerWithSessions = PrismaSpeaker & {
  sessions?: Array<
    SessionSpeaker & {
      session: Session & {
        event: Event;
        room: Room;
      };
    }
  >;
};

/**
 * GET /api/speakers
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includesSessions = searchParams.get("includeSessions") === "true";

    const speakers = await prisma.speaker.findMany({
      orderBy: {
        fullName: "asc",
      },
      include: includesSessions ? {
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
      } : undefined,
    }) as SpeakerWithSessions[];

    const transformedSpeakers = speakers.map((speaker) => {
      if (!includesSessions) {
        return speaker;
      }

      return {
        ...speaker,
        sessions: speaker.sessions?.map((ss) => ss.session) || [],
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedSpeakers,
      count: speakers.length,
    });
  } catch (error) {
    console.error("Error fetching speakers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des intervenants",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/speakers
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, profilePhoto, bio, externalLinks } = body;

    if (!fullName || !bio) {
      return NextResponse.json(
        {
          success: false,
          error: "Le nom complet et la biographie sont requis",
        },
        { status: 400 }
      );
    }

    const speaker = await prisma.speaker.create({
      data: {
        fullName,
        profilePhoto: profilePhoto || null,
        bio,
        externalLinks: externalLinks || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: speaker,
        message: "Intervenant créé avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating speaker:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création de l'intervenant",
      },
      { status: 500 }
    );
  }
}
