"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
}

export function EnrollButton({ courseId, isEnrolled: initialEnrolled }: EnrollButtonProps) {
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(initialEnrolled);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: isEnrolled ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erro na operação");
        return;
      }

      setIsEnrolled(!isEnrolled);
      toast.success(isEnrolled ? "Matrícula cancelada" : "Matriculado com sucesso!");
      router.refresh();
    } catch {
      toast.error("Erro na operação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={isEnrolled ? "outline" : "default"}
    >
      {isEnrolled && <CheckCircle className="mr-2 h-4 w-4" />}
      {loading
        ? "Processando..."
        : isEnrolled
          ? "Matriculado"
          : "Matricular-se"}
    </Button>
  );
}
