import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await (params as any);
        const body = await request.json();

        // Convert date strings to Date objects if they exist in the update
        const data: any = { ...body };
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        const project = await prisma.project.update({
            where: { id },
            data,
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error("Failed to update project:", error);
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await (params as any);
        await prisma.project.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Project deleted" });
    } catch (error) {
        console.error("Failed to delete project:", error);
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
