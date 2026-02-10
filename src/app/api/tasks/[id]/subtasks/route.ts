import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: taskId } = await (params as any);
        const body = await request.json();
        const { text } = body;

        const subtask = await prisma.subtask.create({
            data: {
                text,
                taskId,
            },
        });

        return NextResponse.json(subtask);
    } catch (error) {
        console.error("Failed to add subtask:", error);
        return NextResponse.json({ error: "Failed to add subtask" }, { status: 500 });
    }
}
