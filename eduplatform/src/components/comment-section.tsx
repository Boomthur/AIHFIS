"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentItem } from "./comment-item";
import { MessageSquare } from "lucide-react";

interface CommentUser {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  lessonId: string;
  parentId: string | null;
  user: CommentUser;
  replies: Comment[];
}

interface CommentSectionProps {
  lessonId: string;
  currentUserId: string;
  initialComments: Comment[];
}

export function CommentSection({
  lessonId,
  currentUserId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, lessonId }),
      });

      if (!res.ok) {
        toast.error("Erro ao enviar comentário");
        return;
      }

      const newComment = await res.json();
      setComments([{ ...newComment, replies: [] }, ...comments]);
      setContent("");
      toast.success("Comentário enviado!");
    } catch {
      toast.error("Erro ao enviar comentário");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string, replyContent: string) {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent, lessonId, parentId }),
    });

    if (!res.ok) {
      toast.error("Erro ao enviar resposta");
      return;
    }

    const newReply = await res.json();
    setComments(
      comments.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...c.replies, { ...newReply, replies: [] }] }
          : c
      )
    );
    toast.success("Resposta enviada!");
  }

  async function handleDelete(commentId: string, parentId?: string | null) {
    const res = await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Erro ao excluir comentário");
      return;
    }

    if (parentId) {
      setComments(
        comments.map((c) =>
          c.id === parentId
            ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) }
            : c
        )
      );
    } else {
      setComments(comments.filter((c) => c.id !== commentId));
    }
    toast.success("Comentário excluído");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-lg font-semibold">
          Comentários ({comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)})
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Escreva um comentário..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          rows={3}
        />
        <Button type="submit" disabled={submitting || !content.trim()}>
          {submitting ? "Enviando..." : "Enviar"}
        </Button>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Nenhum comentário ainda. Seja o primeiro!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
