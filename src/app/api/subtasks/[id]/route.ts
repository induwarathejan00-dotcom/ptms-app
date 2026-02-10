import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await (params as any);
        const body = await request.json();
        const { completed, text } = body;

        const subtask = await prisma.subtask.update({
            where: { id },
            data: {
                completed,
                text,
            },
        });

        return NextResponse.json(subtask);
    } catch (error) {
        console.error("Failed to update subtask:", error);
        return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await (params as any);
        await prisma.subtask.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Subtask deleted" });
    } catch (error) {
        console.error("Failed to delete subtask:", error);
        return NextResponse.json({ error: "Failed to delete subtask" }, { status: 500 });
    }
}
