import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { request } from "https";
import { requireOrganizer } from '@/lib/auth/requireOrganizer';

export async function GET() {
    try {
        const sessions = await prisma.session.findMany({
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
        return NextResponse.json(sessions, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authResult = await requireOrganizer(req);
        if ('status' in authResult) {
            return authResult;
        }

        const { user } = authResult;
        const body = await req.json();
        const { title, description, startTime, endTime, eventId, roomId, speakerIds } = body;

        const newSession = await prisma.session.create({
            data: {
                title,
                description,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                eventId,
                roomId,
                speakers: {
                    create: speakerIds.map((speakerId: string) => ({ speakerId })),
                },
            },
        });

        return NextResponse.json(newSession, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
}