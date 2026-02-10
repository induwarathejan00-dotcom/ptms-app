import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            include: {
                tasks: {
                    include: {
                        subtasks: true,
                        tags: true,
                    },
                },
            },
        });
        return NextResponse.json(projects);
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, name, url, audience, isFavorite, status, priority, startDate, endDate, logoUrl } = body;

        const project = await prisma.project.create({
            data: {
                id,
                name,
                url,
                audience,
                isFavorite: isFavorite || false,
                status,
                priority,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                logoUrl,
            },
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error("Failed to create project:", error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
