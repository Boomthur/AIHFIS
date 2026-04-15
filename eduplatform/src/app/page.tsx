import Link from "next/link";
import { BookOpen, Upload, MessageSquare, GraduationCap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-6 w-6 text-primary" />
          EduPlatform
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
            Entrar
          </Link>
          <Link href="/register" className={cn(buttonVariants())}>
            Criar Conta
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="flex flex-col items-center gap-6 px-6 py-24 text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Aprenda e ensine com videoaulas de qualidade
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Plataforma gratuita onde professores compartilham conhecimento
            e alunos aprendem no seu ritmo, com interação em tempo real.
          </p>
          <div className="flex gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Comece agora
            </Link>
            <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              Já tenho conta
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/40 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Como funciona
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              <FeatureCard
                icon={Upload}
                title="Para Professores"
                description="Faça upload de videoaulas, organize em cursos e interaja com seus alunos pelos comentários."
              />
              <FeatureCard
                icon={GraduationCap}
                title="Para Alunos"
                description="Matricule-se em cursos, assista aulas no seu ritmo e tire dúvidas diretamente com o professor."
              />
              <FeatureCard
                icon={MessageSquare}
                title="Interação"
                description="Sistema de comentários com respostas aninhadas. Tire dúvidas e compartilhe conhecimento."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        EduPlatform &mdash; Plataforma de aprendizado gratuita
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-background p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
