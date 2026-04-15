import Link from "next/link";
import { Play, Clock, Lock } from "lucide-react";

interface LessonCardProps {
  id: string;
  title: string;
  description: string;
  teacherName: string;
  duration: number | null;
  index: number;
  isAccessible: boolean;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function LessonCard({
  id,
  title,
  description,
  teacherName,
  duration,
  index,
  isAccessible,
}: LessonCardProps) {
  const content = (
    <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
        {isAccessible ? index : <Lock className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{title}</h3>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Por {teacherName}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
        {duration && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(duration)}
          </span>
        )}
        {isAccessible && <Play className="h-4 w-4 text-primary" />}
      </div>
    </div>
  );

  if (isAccessible) {
    return <Link href={`/lessons/${id}`}>{content}</Link>;
  }

  return content;
}
