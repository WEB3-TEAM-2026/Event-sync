import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSessionLive } from "@/lib/utils/date";

/**
 * GET /api/sessions/[id]/questions
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        startTime: true,
        endTime: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Session non trouvée",
        },
        { status: 404 }
      );
    }

    const questions = await prisma.question.findMany({
      where: {
        sessionId,
      },
      orderBy: [
        {
          upvotes: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    const isLive = isSessionLive(session.startTime, session.endTime);

    return NextResponse.json({
      success: true,
      data: questions,
      meta: {
        count: questions.length,
        isLive,
        sessionId,
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des questions",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions/[id]/questions
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await request.json();
    const { content, authorName } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Le contenu de la question est requis",
        },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "La question ne peut pas dépasser 1000 caractères",
        },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Session non trouvée",
        },
        { status: 404 }
      );
    }

    const isLive = isSessionLive(session.startTime, session.endTime);

    if (!isLive) {
      return NextResponse.json(
        {
          success: false,
          error: "Les questions ne peuvent être posées que pendant la session",
          meta: {
            sessionTitle: session.title,
            startTime: session.startTime,
            endTime: session.endTime,
          },
        },
        { status: 403 }
      );
    }

    const question = await prisma.question.create({
      data: {
        content: content.trim(),
        authorName: authorName?.trim() || null,
        sessionId,
        upvotes: 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: question,
        message: "Question créée avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création de la question",
      },
      { status: 500 }
    );
  }
}
