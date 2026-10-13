"use client";

import React, { useState } from "react";
import { Play, AlertCircle, Cloud, CheckCircle2 } from "lucide-react";

interface VideoPlayerProps {
  src: string | null;
  title?: string;
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // If no URL is provided or invalid
  if (!src) {
    return (
      <div className="w-full aspect-video rounded-xl bg-muted/60 border border-dashed border-border flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <AlertCircle className="w-10 h-10 mb-2 text-amber-500" />
        <p className="font-medium text-foreground">No Media Link Attached</p>
        <p className="text-xs max-w-sm mt-1">
          An Azure Blob Storage streaming URL has not been configured for this course module yet.
        </p>
      </div>
    );
  }

  const isAzureBlob = src.toLowerCase().includes("blob.core.windows.net") || src.toLowerCase().includes("azure");

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-border/50 group">
      {/* Native HTML5 Video Element as specified in requirements */}
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-lg aspect-video object-contain bg-black"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
      >
        Your browser does not support the video tag.
      </video>

      {/* Azure Media Header Overlay badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono text-white border border-white/10 shadow-sm">
          <Cloud className={`w-3.5 h-3.5 ${isAzureBlob ? "text-sky-400" : "text-emerald-400"}`} />
          <span>{isAzureBlob ? "Azure Blob Stream" : "HTML5 Media"}</span>
        </div>
      </div>

      {/* Fallback Error Overlay if the stream fails to load */}
      {hasError && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
          <h4 className="font-semibold text-foreground text-sm">Media Playback Notice</h4>
          <p className="text-xs text-muted-foreground max-w-md mt-1 mb-4">
            The external streaming endpoint could not be reached. Ensure CORS is enabled on the Azure Blob container or test using the sample media stream.
          </p>
          <div className="text-left w-full max-w-md p-3 rounded-lg bg-muted text-[11px] font-mono break-all text-muted-foreground">
            {src}
          </div>
          <button
            onClick={() => setHasError(false)}
            className="mt-4 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Retry Stream
          </button>
        </div>
      )}
    </div>
  );
}

