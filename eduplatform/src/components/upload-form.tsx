"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadFormProps {
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
}

export function UploadForm({ onUploadComplete, currentUrl }: UploadFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(currentUrl || "");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError("");

      const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
      if (!allowedTypes.includes(file.type)) {
        setError("Formato não suportado. Use MP4, WebM ou MOV");
        return;
      }

      if (file.size > 500 * 1024 * 1024) {
        setError("Arquivo muito grande. Máximo 500MB");
        return;
      }

      setFileName(file.name);
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setPreviewUrl(data.url);
          onUploadComplete(data.url);
        } else {
          setError("Erro no upload. Tente novamente.");
        }
        setUploading(false);
        xhrRef.current = null;
      });

      xhr.addEventListener("error", () => {
        setError("Erro no upload. Tente novamente.");
        setUploading(false);
        xhrRef.current = null;
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    },
    [onUploadComplete]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleCancel() {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setUploading(false);
    setProgress(0);
    setFileName("");
  }

  if (previewUrl && !uploading) {
    return (
      <div className="space-y-2">
        <video
          src={previewUrl}
          controls
          className="w-full rounded-lg border aspect-video bg-black"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setPreviewUrl("");
            onUploadComplete("");
          }}
        >
          Trocar vídeo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {uploading ? (
          <div className="w-full space-y-3">
            <Film className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">{fileName}</p>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground">{progress}%</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
            >
              <X className="mr-1 h-3 w-3" />
              Cancelar
            </Button>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Arraste um vídeo ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">
              MP4, WebM ou MOV (máx. 500MB)
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
