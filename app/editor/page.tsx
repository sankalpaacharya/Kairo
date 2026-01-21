"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRecordingTimer, useWebcam } from "@/features/recorder";
import { useRecordingContext } from "@/features/recorder/context";
import { VideoPreview } from "@/features/recorder/components/video-preview";
import { WebcamOverlay } from "@/features/recorder/components/webcam-overlay";
import { HeaderBar, BottomToolbar, Timeline } from "@/features/editor";
import { Sidebar, PRESET_GRADIENTS } from "@/features/customization";

export default function EditorPage() {
  const router = useRouter();
  const { recordedBlob, setRecordedBlob } = useRecordingContext();
  const { time, formatted, reset: resetTimer } = useRecordingTimer();
  const { stream: webcamStream, isActive: webcamActive } = useWebcam();

  // Background customization state
  const [background, setBackground] = useState<{
    colors: string[];
    id: string;
  }>({
    colors: [...PRESET_GRADIENTS[0].colors],
    id: PRESET_GRADIENTS[0].id,
  });
  const [padding, setPadding] = useState(20);
  const [blur, setBlur] = useState(0);

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
    resetTimer();
    router.push("/");
  };

  const handleBackgroundChange = (id: string, colors: readonly string[]) => {
    setBackground({ id, colors: [...colors] });
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
            style={{
              background: `linear-gradient(135deg, ${background.colors[0]}, ${background.colors[1]})`,
              padding: `${padding}px`,
            }}
          >
            {/* Video Preview */}
            <VideoPreview
              recordedBlob={recordedBlob}
              isRecording={false}
              className="shadow-lg"
            />

            {/* Webcam Overlay */}
            <WebcamOverlay stream={webcamStream} isActive={webcamActive} />
          </div>
        </main>

        {/* Bottom Toolbar */}
        <BottomToolbar
          recordingState="stopped"
          currentTime={formatted}
          onStartRecording={handleNewRecording}
          onStopRecording={() => {}}
          onPauseRecording={() => {}}
          onResumeRecording={() => {}}
        />

        {/* Timeline */}
        <Timeline duration={time} currentTime={time} isRecording={false} />
      </div>

      {/* Right Sidebar */}
      <Sidebar
        background={background}
        onBackgroundChange={handleBackgroundChange}
        padding={padding}
        onPaddingChange={setPadding}
        blur={blur}
        onBlurChange={setBlur}
      />
    </div>
  );
}
