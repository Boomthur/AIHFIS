import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LessonCard } from "@/components/lesson-card";
import { EnrollButton } from "@/components/enroll-button";
import { BookOpen, Users } from "lucide-react";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await getCurrentUser();

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

  if (!course) notFound();

  const isEnrolled = user
    ? course.enrollments.some((e) => e.userId === user.id)
    : false;
  const isTeacher = user?.role === "TEACHER";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="mt-2 text-muted-foreground">{course.description}</p>
        <div className="mt-4 flex items-center gap-4">
          <Badge variant="secondary" className="gap-1">
            <BookOpen className="h-3 w-3" />
            {course._count.lessons} {course._count.lessons === 1 ? "aula" : "aulas"}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {course._count.enrollments} {course._count.enrollments === 1 ? "aluno" : "alunos"}
          </Badge>
        </div>
        {!isTeacher && user && (
          <div className="mt-4">
            <EnrollButton courseId={course.id} isEnrolled={isEnrolled} />
          </div>
        )}
      </div>

      <Separator />

      <div className="mt-6">
        <h2 className="mb-4 text-xl font-semibold">Aulas</h2>
        {course.lessons.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            Nenhuma aula publicada ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {course.lessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                description={lesson.description}
                teacherName={lesson.teacher.name}
                duration={lesson.duration}
                index={index + 1}
                isAccessible={isEnrolled || isTeacher}
              />
            ))}
          </div>
        )}
      </div>

      {!isEnrolled && !isTeacher && course.lessons.length > 0 && (
        <div className="mt-6 rounded-lg border bg-muted/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Matricule-se no curso para acessar as aulas
          </p>
          <div className="mt-3">
            <EnrollButton courseId={course.id} isEnrolled={false} />
          </div>
        </div>
      )}
    </div>
  );
}
