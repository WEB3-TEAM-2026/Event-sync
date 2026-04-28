import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { request } from "https";

export async function GET(){
    try {
        const sessions = await prisma.session.findMany();
        return NextResponse.json(sessions);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const newSession = await prisma.session.create({
            data: {
                name: body.name,
                description: body.description,
            },
        });
        return NextResponse.json(newSession, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
}