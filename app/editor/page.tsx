"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWebcam } from "@/features/recorder";
import { useRecordingContext } from "@/features/recorder/context";
import { VideoPreview } from "@/features/recorder/components/video-preview";
import { WebcamOverlay } from "@/features/recorder/components/webcam-overlay";
import {
  HeaderBar,
  BottomToolbar,
  Timeline,
  useVideoPlayer,
  CropModal,
  ASPECT_RATIOS,
  useTrim,
} from "@/features/editor";
import type { CropArea, AspectRatioOption } from "@/features/editor";
import { Sidebar, PRESET_GRADIENTS } from "@/features/customization";

export default function EditorPage() {
  const router = useRouter();
  const { recordedBlob, setRecordedBlob } = useRecordingContext();
  const { stream: webcamStream, isActive: webcamActive } = useWebcam();

  // Create a stable video URL from the blob
  const videoUrl = useMemo(() => {
    if (recordedBlob) {
      return URL.createObjectURL(recordedBlob);
    }
    return null;
  }, [recordedBlob]);

  // Clean up the object URL when component unmounts or blob changes
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    formattedCurrentTime,
    formattedDuration,
    error,
    play,
    pause,
    toggle,
    seek,
    seekByPercent,
    skipForward,
    skipBackward,
  } = useVideoPlayer(videoUrl);

  // Background customization state
  const [background, setBackground] = useState<{
    colors: string[];
    id: string;
  } | null>({
    colors: [...PRESET_GRADIENTS[0].colors],
    id: PRESET_GRADIENTS[0].id,
  });
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [padding, setPadding] = useState(20);
  const [blur, setBlur] = useState(0);

  // Crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);

  // Aspect ratio state
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("16:9");

  // Recording title state (used for export filename)
  const [recordingTitle, setRecordingTitle] = useState("Screen Recording");

  // Trim state
  const {
    trimStart,
    trimEnd,
    trimmedDuration,
    isTrimmed,
    setTrimStart,
    setTrimEnd,
    resetTrim,
  } = useTrim(duration);

  // Reset trim when duration changes (new video loaded)
  useEffect(() => {
    if (duration > 0) {
      resetTrim(duration);
    }
  }, [duration, resetTrim]);

  // Redirect to landing if no recorded blob
  useEffect(() => {
    if (!recordedBlob) {
      router.push("/");
    }
  }, [recordedBlob, router]);

  const handleExport = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement("a");
      a.href = url;
      const sanitizedTitle = recordingTitle
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .replace(/\s+/g, "-");
      a.download = `${sanitizedTitle}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleNewRecording = () => {
    setRecordedBlob(null);
    router.push("/");
  };

  const handleBackgroundChange = (id: string, colors: readonly string[]) => {
    setBackground({ id, colors: [...colors] });
    setBackgroundImage(null);
  };

  const handleImageChange = (path: string) => {
    console.log("handleImageChange called with:", path);
    setBackgroundImage(path);
    setBackground(null);
  };

  const getBackgroundStyle = () => {
    console.log(
      "getBackgroundStyle - backgroundImage:",
      backgroundImage,
      "background:",
      background,
    );
    if (backgroundImage) {
      // Encode the URL to handle spaces and special characters
      const encodedUrl = encodeURI(backgroundImage);
      console.log("Using image background:", encodedUrl);
      return {
        backgroundImage: `url("${encodedUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: `${padding}px`,
      };
    }
    if (background) {
      return {
        background: `linear-gradient(135deg, ${background.colors[0]}, ${background.colors[1]})`,
        padding: `${padding}px`,
      };
    }
    return { padding: `${padding}px` };
  };

  // Enforce trim bounds during playback
  // Only trigger when trimEnd > 0 (meaning duration has loaded and trim is set)
  useEffect(() => {
    if (isPlaying && trimEnd > 0 && currentTime >= trimEnd) {
      pause();
      if (videoRef.current) {
        videoRef.current.currentTime = trimStart;
      }
    }
  }, [currentTime, trimEnd, trimStart, isPlaying, pause, videoRef]);

  // Trim-aware playback handlers
  const handlePlayProxy = () => {
    if (currentTime >= trimEnd || currentTime < trimStart) {
      seek(trimStart);
      // Wait for seek to complete before playing to avoid race condition
      setTimeout(() => {
        play();
      }, 50);
    } else {
      play();
    }
  };

  const handleSkipBackwardProxy = () => {
    const newTime = Math.max(trimStart, currentTime - 5);
    seek(newTime);
  };

  const handleSkipForwardProxy = () => {
    const newTime = Math.min(trimEnd, currentTime + 5);
    seek(newTime);
  };

  if (!recordedBlob) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <HeaderBar
          title={recordingTitle}
          onTitleChange={setRecordingTitle}
          onExport={handleExport}
          isExporting={false}
        />

        {/* Video Preview Area */}
        <main className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div
            className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center"
            style={{
              ...getBackgroundStyle(),
              aspectRatio:
                aspectRatio === "auto"
                  ? "auto"
                  : (ASPECT_RATIOS.find(
                      (r) => r.value === aspectRatio,
                    )?.ratio?.toString() ?? "auto"),
            }}
          >
            {/* Video Preview */}
            <VideoPreview
              videoUrl={videoUrl}
              isRecording={false}
              videoRef={videoRef}
              className="shadow-lg"
              cropArea={cropArea}
            />

            {/* Error Overlay */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                <div className="text-center text-white p-6 max-w-md">
                  <p className="font-medium text-lg mb-2">Failed to load video</p>
                  <p className="text-sm text-gray-300">{error}</p>
                </div>
              </div>
            )}

            {/* Webcam Overlay */}
            <WebcamOverlay stream={webcamStream} isActive={webcamActive} />
          </div>
        </main>

        {/* Bottom Toolbar */}
        <BottomToolbar
          isPlaying={isPlaying}
          currentTime={formattedCurrentTime}
          duration={formattedDuration}
          aspectRatio={aspectRatio}
          onPlay={handlePlayProxy}
          onPause={pause}
          onSkipForward={handleSkipForwardProxy}
          onSkipBackward={handleSkipBackwardProxy}
          onAspectRatioChange={setAspectRatio}
          onNewRecording={handleNewRecording}
          onCropClick={() => setCropModalOpen(true)}
        />

        {/* Timeline with trim handles */}
        <Timeline
          duration={duration}
          currentTime={currentTime}
          isRecording={false}
          onSeek={seekByPercent}
          trimStart={trimStart}
          trimEnd={trimEnd}
          onTrimStartChange={setTrimStart}
          onTrimEndChange={setTrimEnd}
        />
      </div>

      {/* Right Sidebar */}
      <Sidebar
        background={background}
        backgroundImage={backgroundImage}
        onBackgroundChange={handleBackgroundChange}
        onImageChange={handleImageChange}
        padding={padding}
        onPaddingChange={setPadding}
        blur={blur}
        onBlurChange={setBlur}
      />

      {/* Crop Modal */}
      <CropModal
        open={cropModalOpen}
        onOpenChange={setCropModalOpen}
        videoRef={videoRef}
        onCropApply={setCropArea}
        currentCrop={cropArea}
      />
    </div>
  );
}
