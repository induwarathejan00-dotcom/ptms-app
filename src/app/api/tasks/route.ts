import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { projectId, text, completed, priority, status, description, dueDate, subtasks, tags } = body;

        const task = await prisma.task.create({
            data: {
                text,
                completed: completed || false,
                priority,
                status,
                description,
                dueDate: dueDate ? new Date(dueDate) : null,
                projectId,
                subtasks: {
                    create: subtasks?.map((st: any) => ({
                        text: st.text,
                        completed: st.completed || false,
                    })) || [],
                },
                tags: {
                    connectOrCreate: (tags || []).map((tag: string) => ({
                        where: { text: tag },
                        create: { text: tag },
                    })),
                },
            },
            include: {
                subtasks: true,
                tags: true,
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("Failed to create task:", error);
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}
