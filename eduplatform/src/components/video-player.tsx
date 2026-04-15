"use client";

interface VideoPlayerProps {
  src: string;
  poster?: string | null;
}

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  // Use streaming endpoint for uploaded videos
  const videoSrc = src.startsWith("/uploads/videos/")
    ? `/api/stream/${src.split("/").pop()}`
    : src;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <video
        src={videoSrc}
        poster={poster || undefined}
        controls
        className="h-full w-full"
        preload="metadata"
      />
    </div>
  );
}
