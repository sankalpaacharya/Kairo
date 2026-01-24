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
  const { recordedBlob, recordedMimeType, setRecordedBlob } = useRecordingContext();
  const { stream: webcamStream, isActive: webcamActive } = useWebcam();
  const [blobError, setBlobError] = useState<string | null>(null);

  // Create a stable video URL from the blob
  const videoUrl = useMemo(() => {
    setBlobError(null);

    if (!recordedBlob) {
      console.log('No recordedBlob available');
      return null;
    }

    // Validate blob
    if (!(recordedBlob instanceof Blob)) {
      console.error('recordedBlob is not a Blob instance:', typeof recordedBlob);
      setBlobError('Invalid recording data');
      return null;
    }

    if (recordedBlob.size === 0) {
      console.error('recordedBlob is empty (0 bytes)');
      setBlobError('Recording is empty');
      return null;
    }

    console.log('Creating blob URL:', {
      size: recordedBlob.size,
      type: recordedBlob.type,
      mimeType: recordedMimeType
    });

    try {
      // Create blob with explicit MIME type
      const blob = new Blob([recordedBlob], {
        type: recordedMimeType || 'video/webm'
      });

      const url = URL.createObjectURL(blob);
      console.log('Successfully created blob URL:', url);

      // Store URL for later cleanup
      return url;
    } catch (error) {
      console.error('Error creating blob URL:', error);
      setBlobError('Failed to create video URL');
      return null;
    }
  }, [recordedBlob, recordedMimeType]);

  // Cleanup old blob URLs when recordedBlob changes
  useEffect(() => {
    let previousUrl: string | null = null;

    return () => {
      // Revoke previous URL when blob changes
      if (previousUrl && previousUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previousUrl);
      }
      previousUrl = videoUrl;
    };
  }, [recordedBlob]); // Only when blob changes, not videoUrl

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

      const extension = recordedMimeType?.includes('mp4') ? 'mp4' : 'webm';
      a.download = `${sanitizedTitle}.${extension}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleNewRecording = () => {
    if (videoUrl && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl);
    }
    setRecordedBlob(null);
    router.push("/");
  };

  const handleBackgroundChange = (id: string, colors: readonly string[]) => {
    setBackground({ id, colors: [...colors] });
    setBackgroundImage(null);
  };

  const handleImageChange = (path: string) => {
    setBackgroundImage(path);
    setBackground(null);
  };

  const getBackgroundStyle = () => {
    if (backgroundImage) {
      const encodedUrl = encodeURI(backgroundImage);
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
  useEffect(() => {
    if (isPlaying && duration > 0 && trimEnd > 0 && trimEnd < duration && currentTime >= trimEnd) {
      pause();
      if (videoRef.current) {
        videoRef.current.currentTime = trimStart;
      }
    }
  }, [currentTime, trimEnd, trimStart, isPlaying, pause, videoRef, duration]);

  // Trim-aware playback handlers
  const handlePlayProxy = () => {
    const isTrimmed = trimStart > 0 || (trimEnd > 0 && trimEnd < duration);

    if (isTrimmed && (currentTime >= trimEnd || currentTime < trimStart)) {
      seek(trimStart);
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

  // Show error if blob URL creation failed
  const displayError = blobError || error;

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
            {videoUrl && !displayError && (
              <VideoPreview
                videoUrl={videoUrl}
                videoMimeType={recordedMimeType}
                isRecording={false}
                videoRef={videoRef}
                className="shadow-lg"
                cropArea={cropArea}
              />
            )}

            {/* Error Overlay */}
            {displayError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                <div className="text-center text-white p-6 max-w-md">
                  <p className="font-medium text-lg mb-2">Failed to load video</p>
                  <p className="text-sm text-gray-300 mb-4">{displayError}</p>
                  <div className="text-xs text-gray-400 mb-4 text-left bg-gray-900 p-3 rounded">
                    <p>Debug info:</p>
                    <p>• Blob size: {recordedBlob?.size || 0} bytes</p>
                    <p>• Blob type: {recordedBlob?.type || 'unknown'}</p>
                    <p>• MIME type: {recordedMimeType || 'not set'}</p>
                    <p>• Video URL: {videoUrl ? 'created' : 'failed'}</p>
                  </div>
                  <button
                    onClick={handleNewRecording}
                    className="mt-4 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition"
                  >
                    Try New Recording
                  </button>
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