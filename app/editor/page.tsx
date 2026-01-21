"use client";

import { useState, useEffect } from "react";
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
} from "@/features/editor";
import type { CropArea } from "@/features/editor";
import { Sidebar, PRESET_GRADIENTS } from "@/features/customization";

export default function EditorPage() {
  const router = useRouter();
  const { recordedBlob, setRecordedBlob } = useRecordingContext();
  const { stream: webcamStream, isActive: webcamActive } = useWebcam();

  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    formattedCurrentTime,
    formattedDuration,
    play,
    pause,
    toggle,
    seekByPercent,
    skipForward,
    skipBackward,
  } = useVideoPlayer();

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
      a.download = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.webm`;
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
          title="Screen Recording"
          onExport={handleExport}
          isExporting={false}
        />

        {/* Video Preview Area */}
        <main className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div
            className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl"
            style={getBackgroundStyle()}
          >
            {/* Video Preview */}
            <VideoPreview
              recordedBlob={recordedBlob}
              isRecording={false}
              videoRef={videoRef}
              className="shadow-lg"
              cropArea={cropArea}
            />

            {/* Webcam Overlay */}
            <WebcamOverlay stream={webcamStream} isActive={webcamActive} />
          </div>
        </main>

        {/* Bottom Toolbar */}
        <BottomToolbar
          isPlaying={isPlaying}
          currentTime={formattedCurrentTime}
          duration={formattedDuration}
          onPlay={play}
          onPause={pause}
          onSkipForward={() => skipForward(5)}
          onSkipBackward={() => skipBackward(5)}
          onNewRecording={handleNewRecording}
          onCropClick={() => setCropModalOpen(true)}
        />

        {/* Timeline */}
        <Timeline
          duration={duration}
          currentTime={currentTime}
          isRecording={false}
          onSeek={seekByPercent}
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
