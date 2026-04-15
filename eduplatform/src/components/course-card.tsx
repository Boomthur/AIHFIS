import Link from "next/link";
import { BookOpen, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  lessonsCount: number;
  enrollmentsCount: number;
}

export function CourseCard({
  id,
  title,
  description,
  lessonsCount,
  enrollmentsCount,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="line-clamp-1 text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        </CardContent>
        <CardFooter className="gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {lessonsCount} {lessonsCount === 1 ? "aula" : "aulas"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {enrollmentsCount} {enrollmentsCount === 1 ? "aluno" : "alunos"}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
