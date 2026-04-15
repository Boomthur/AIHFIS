import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { CourseCard } from "@/components/course-card";
import { CreateCourseButton } from "@/components/create-course-button";

export default async function CoursesPage() {
  const user = await getCurrentUser();

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { lessons: true, enrollments: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cursos Disponíveis</h1>
          <p className="text-sm text-muted-foreground">
            Explore cursos e comece a aprender
          </p>
        </div>
        {user?.role === "TEACHER" && <CreateCourseButton />}
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">Nenhum curso disponível</p>
          <p className="text-sm text-muted-foreground">
            {user?.role === "TEACHER"
              ? "Crie o primeiro curso para começar!"
              : "Em breve novos cursos estarão disponíveis."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              lessonsCount={course._count.lessons}
              enrollmentsCount={course._count.enrollments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
