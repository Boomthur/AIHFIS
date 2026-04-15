import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      teacher: { select: { id: true, name: true, avatarUrl: true, role: true } },
      course: { select: { id: true, title: true } },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
  }

  return NextResponse.json(lesson);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const existing = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!existing || existing.teacherId !== user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        videoUrl: body.videoUrl ?? existing.videoUrl,
        thumbnailUrl: body.thumbnailUrl ?? existing.thumbnailUrl,
        isPublished: body.isPublished ?? existing.isPublished,
        courseId: body.courseId ?? existing.courseId,
      },
    });

    return NextResponse.json(lesson);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar aula" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson || lesson.teacherId !== user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    // Delete video file
    if (lesson.videoUrl) {
      const filePath = join(process.cwd(), "public", lesson.videoUrl);
      await unlink(filePath).catch(() => {});
    }

    await prisma.comment.deleteMany({ where: { lessonId } });
    await prisma.lesson.delete({ where: { id: lessonId } });

    return NextResponse.json({ message: "Aula excluída" });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir aula" }, { status: 500 });
  }
}
