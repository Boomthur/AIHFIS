import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { lessonSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const teacherId = searchParams.get("teacherId");

  const where: Record<string, unknown> = {};
  if (courseId) where.courseId = courseId;
  if (teacherId) where.teacherId = teacherId;

  const lessons = await prisma.lesson.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      teacher: { select: { id: true, name: true, avatarUrl: true } },
      course: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json(lessons);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = lessonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        videoUrl: body.videoUrl,
        thumbnailUrl: body.thumbnailUrl || null,
        duration: body.duration || null,
        isPublished: parsed.data.isPublished,
        teacherId: user.id,
        courseId: parsed.data.courseId || null,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar aula" }, { status: 500 });
  }
}
