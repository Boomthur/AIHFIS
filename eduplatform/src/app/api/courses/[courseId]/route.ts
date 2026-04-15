import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { courseSchema } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        where: { isPublished: true },
        orderBy: { createdAt: "asc" },
        include: {
          teacher: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      enrollments: { select: { userId: true } },
      _count: { select: { lessons: true, enrollments: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = courseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
      },
    });

    return NextResponse.json(course);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar curso" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    await prisma.course.delete({ where: { id: courseId } });
    return NextResponse.json({ message: "Curso excluído" });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir curso" }, { status: 500 });
  }
}
