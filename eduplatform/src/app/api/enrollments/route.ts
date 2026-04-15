import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          _count: { select: { lessons: true, enrollments: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return NextResponse.json(enrollments);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: "courseId obrigatório" }, { status: 400 });
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });

    if (existing) {
      return NextResponse.json({ error: "Já matriculado" }, { status: 409 });
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId: user.id, courseId },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro na matrícula" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { courseId } = await request.json();

    await prisma.enrollment.delete({
      where: { userId_courseId: { userId: user.id, courseId } },
    });

    return NextResponse.json({ message: "Matrícula cancelada" });
  } catch {
    return NextResponse.json({ error: "Erro ao cancelar matrícula" }, { status: 500 });
  }
}
