import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await (params as any);
        const body = await request.json();
        const { tags, subtasks, ...otherData } = body;

        const data: any = { ...otherData };
        if (data.dueDate) data.dueDate = new Date(data.dueDate);
        if (data.createdAt) data.createdAt = new Date(data.createdAt);

        if (tags) {
            data.tags = {
                set: [],
                connectOrCreate: tags.map((tag: string) => ({
                    where: { text: tag },
                    create: { text: tag },
                })),
            };
        }

        const task = await prisma.task.update({
            where: { id },
            data,
            include: {
                subtasks: true,
                tags: true,
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("Failed to update task:", error);
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await (params as any);
        await prisma.task.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Task deleted" });
    } catch (error) {
        console.error("Failed to delete task:", error);
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}
