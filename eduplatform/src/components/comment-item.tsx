"use client";

import { useState } from "react";
import { UserAvatar } from "./user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Reply, Trash2 } from "lucide-react";

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
  parentId: string | null;
  user: CommentUser;
  replies: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string, parentId?: string | null) => Promise<void>;
  isReply?: boolean;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return d.toLocaleDateString("pt-BR");
}

export function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  isReply = false,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isOwner = comment.userId === currentUserId;
  const isTeacher = comment.user.role === "TEACHER";

  async function handleReply() {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, replyContent);
    setReplyContent("");
    setShowReplyForm(false);
    setSubmitting(false);
  }

  return (
    <div className={isReply ? "ml-10 border-l-2 pl-4" : ""}>
      <div className="flex gap-3">
        <UserAvatar
          name={comment.user.name}
          avatarUrl={comment.user.avatarUrl}
          className="h-8 w-8 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{comment.user.name}</span>
            {isTeacher && (
              <Badge variant="default" className="text-xs px-1.5 py-0">
                Professor
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="mr-1 h-3 w-3" />
                Responder
              </Button>
            )}
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={() => onDelete(comment.id, comment.parentId)}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Excluir
              </Button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Escreva uma resposta..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                maxLength={2000}
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={submitting || !replyContent.trim()}
                  onClick={handleReply}
                >
                  {submitting ? "Enviando..." : "Enviar"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies?.length > 0 && (
            <div className="mt-4 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onDelete={onDelete}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
