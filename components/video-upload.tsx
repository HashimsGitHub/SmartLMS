"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Link2,
  Cloud,
} from "lucide-react";

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function VideoUpload({ value, onChange, disabled }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video file
    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|webm|ogg|mov|mkv)$/i)) {
      setErrorMessage("Please select a valid video file (MP4, WebM, MOV, etc.)");
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(15);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate step progress for smoother feedback
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 300);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      const data = await res.json();

      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setErrorMessage(data.error || "Failed to upload to Azure Blob Storage.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Upload network error.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    onChange("");
    setUploadedFileName(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Upload mode tabs */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Cloud className="w-3.5 h-3.5 text-blue-500" />
          Course Video (Azure Blob Storage)
        </label>
        <button
          type="button"
          onClick={() => setMode(mode === "file" ? "url" : "file")}
          className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          {mode === "file" ? (
            <>
              <Link2 className="w-3 h-3" /> Or enter URL directly
            </>
          ) : (
            <>
              <UploadCloud className="w-3 h-3" /> Upload video file
            </>
          )}
        </button>
      </div>

      {mode === "file" ? (
        <div className="space-y-2">
          {/* File Dropzone Area */}
          <div
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
              isUploading
                ? "border-blue-500/50 bg-blue-500/5 cursor-wait"
                : value
                ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500"
                : "border-border hover:border-blue-500/60 hover:bg-muted/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={disabled || isUploading}
              className="hidden"
            />

            {isUploading ? (
              <div className="space-y-2 py-2">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-xs font-semibold text-foreground">
                  Uploading to Azure Blob Storage ({uploadProgress}%)...
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Container: course-content · {uploadedFileName}
                </p>
                <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : value ? (
              <div className="flex items-center justify-between p-1">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-foreground truncate max-w-xs">
                      {uploadedFileName || "Uploaded to Azure Blob"}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate max-w-sm">
                      {value}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  title="Remove video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 py-2">
                <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground group-hover:text-blue-500 transition-colors" />
                <p className="text-xs font-semibold text-foreground">
                  Click to select a video file or drag and drop
                </p>
                <p className="text-[11px] text-muted-foreground">
                  MP4, WebM, or MOV · Automatically uploads to your Azure Blob Container
                </p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <input
            type="url"
            placeholder="https://smartlms.blob.core.windows.net/course-content/video.mp4"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <p className="text-[11px] text-muted-foreground">
            Direct streaming link stored in PostgreSQL courses table.
          </p>
        </div>
      )}
    </div>
  );
}

