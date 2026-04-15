import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { VideoPlayer } from "@/components/video-player";
import { CommentSection } from "@/components/comment-section";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      teacher: { select: { id: true, name: true, avatarUrl: true, role: true } },
      course: {
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { createdAt: "asc" },
            select: { id: true, title: true },
          },
          enrollments: { select: { userId: true } },
        },
      },
    },
  });

  if (!lesson) notFound();

  // Check access: teacher or enrolled student
  const isTeacher = user.role === "TEACHER";
  const isEnrolled = lesson.course?.enrollments.some((e) => e.userId === user.id) ?? false;

  if (!isTeacher && !isEnrolled && lesson.courseId) {
    return (
      <div className="mx-auto max-w-2xl text-center py-16">
        <p className="text-lg font-medium">Matricule-se no curso para acessar esta aula</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Você precisa estar matriculado para assistir esta aula.
        </p>
        {lesson.course && (
          <Button asChild className="mt-4">
            <Link href={`/courses/${lesson.course.id}`}>Matricular-se</Link>
          </Button>
        )}
      </div>
    );
  }

  // Nav: previous / next lesson in course
  const courseLessons = lesson.course?.lessons || [];
  const currentIndex = courseLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null;

  const comments = await prisma.comment.findMany({
    where: { lessonId, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, role: true, avatarUrl: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, role: true, avatarUrl: true } },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <VideoPlayer src={lesson.videoUrl} poster={lesson.thumbnailUrl} />

      <div className="mt-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          {lesson.course && (
            <Link
              href={`/courses/${lesson.course.id}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              {lesson.course.title}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <UserAvatar name={lesson.teacher.name} avatarUrl={lesson.teacher.avatarUrl} className="h-8 w-8" />
          <div>
            <p className="text-sm font-medium">{lesson.teacher.name}</p>
            <Badge variant="secondary" className="text-xs">Professor</Badge>
          </div>
        </div>

        <p className="text-muted-foreground">{lesson.description}</p>

        {/* Previous / Next */}
        {courseLessons.length > 1 && (
          <div className="flex justify-between">
            {prevLesson ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/lessons/${prevLesson.id}`}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Anterior
                </Link>
              </Button>
            ) : <div />}
            {nextLesson ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/lessons/${nextLesson.id}`}>
                  Próxima
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : <div />}
          </div>
        )}

        <Separator />

        <CommentSection
          lessonId={lessonId}
          currentUserId={user.id}
          initialComments={comments.map((c) => ({
            ...c,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            replies: c.replies.map((r) => ({
              ...r,
              createdAt: r.createdAt,
              updatedAt: r.updatedAt,
              replies: [],
            })),
          }))}
        />
      </div>
    </div>
  );
}
