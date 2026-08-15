"use client";
import { useRef } from "react";
import { useGSAP } from "@/src/lib/gsap";

/**
 * The mp4 card. Rules #18–20: metadata preload only, poster matching frame one,
 * and IntersectionObserver-driven play/pause so only in-view video decodes —
 * the single biggest perf risk in this build.
 */
export function ProjectVideo({
  src,
  poster,
  className = "",
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useGSAP(
    () => {
      const video = videoRef.current;
      if (!video) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {
                /* placeholder src may not exist yet — poster carries the card */
              });
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.25 }
      );
      io.observe(video);
      return () => io.disconnect();
    },
    { scope: videoRef }
  );

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      playsInline
      loop
      preload="metadata"
      poster={poster}
      src={src}
      data-cursor-media
    />
  );
}
