import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { requireOrganizer } from '@/lib/auth/requireOrganizer';

export async function GET(req: Request, context: { params: { id: string } }) {
    try {
        const { id } = context.params;

        const session = await prisma.session.findUnique({
            where: { id },
            include: {
                room: true,
                event: true,
                speakers: {
                    include: {
                        speaker: true,
                    },
                },
            },
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json(session, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const authResult = await requireOrganizer(req);
        if ('status' in authResult) {
            return authResult;
        }

        const { user } = authResult;
        const body = await req.json();
        const { title, description, startTime, endTime, eventId, roomId, speakerIds } = body;

        const session = await prisma.session.update({
            where: { id: params.id },
            data: {
                title,
                description,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                eventId,
                roomId,
                speakers: {
                    deleteMany: {},
                    create: speakerIds.map((speakerId: string) => ({ speakerId })),
                },
            },
        });

        return NextResponse.json(session, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const authResult = await requireOrganizer(req);
        if ('status' in authResult) {
            return authResult;
        }

        const { user } = authResult;
        await prisma.session.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "Session deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
    }
}