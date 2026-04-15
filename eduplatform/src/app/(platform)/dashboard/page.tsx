import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, BookOpen, Users, MessageSquare, Library } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "TEACHER") {
    return <TeacherDashboard userId={user.id} />;
  }

  return <StudentDashboard userId={user.id} />;
}

async function TeacherDashboard({ userId }: { userId: string }) {
  const [stats, lessons] = await Promise.all([
    Promise.all([
      prisma.course.count(),
      prisma.lesson.count({ where: { teacherId: userId } }),
      prisma.enrollment.count({
        where: { course: { lessons: { some: { teacherId: userId } } } },
      }),
      prisma.comment.count({
        where: { lesson: { teacherId: userId } },
      }),
    ]),
    prisma.lesson.findMany({
      where: { teacherId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        course: { select: { title: true } },
      },
    }),
  ]);

  const [coursesCount, lessonsCount, studentsCount, commentsCount] = stats;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard do Professor</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas aulas e acompanhe seus alunos
          </p>
        </div>
        <Button asChild>
          <Link href="/lessons/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Nova Aula
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Cursos" value={coursesCount} />
        <StatCard icon={Library} label="Aulas" value={lessonsCount} />
        <StatCard icon={Users} label="Alunos" value={studentsCount} />
        <StatCard icon={MessageSquare} label="Comentários" value={commentsCount} />
      </div>

      <Separator />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Aulas Recentes</h2>
        {lessons.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            Você ainda não criou nenhuma aula.
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {lesson.course?.title || "Sem curso"} &middot;{" "}
                    {lesson.isPublished ? "Publicada" : "Rascunho"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function StudentDashboard({ userId }: { userId: string }) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          _count: { select: { lessons: true, enrollments: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard do Aluno</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe seus cursos e continue aprendendo
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/courses">Explorar Cursos</Link>
        </Button>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Minhas Matrículas</h2>
        {enrollments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-lg font-medium">Nenhuma matrícula ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore os cursos disponíveis e comece a aprender!
            </p>
            <Button asChild className="mt-4">
              <Link href="/courses">Explorar Cursos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <CourseCard
                key={enrollment.id}
                id={enrollment.course.id}
                title={enrollment.course.title}
                description={enrollment.course.description}
                lessonsCount={enrollment.course._count.lessons}
                enrollmentsCount={enrollment.course._count.enrollments}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
