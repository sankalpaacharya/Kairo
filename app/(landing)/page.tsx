"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  RecordIcon,
  PlayCircleIcon,
  LockIcon,
} from "@hugeicons/core-free-icons";
import { useMediaRecorder } from "@/features/recorder";
import { useRecordingContext } from "@/features/recorder/context";

export default function LandingPage() {
  const router = useRouter();
  const { setRecordedBlob } = useRecordingContext();
  const { startRecording } = useMediaRecorder();

  const handleShareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" },
        audio: true,
      });

      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        router.push("/editor");
      };

      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      };

      mediaRecorder.start(100);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <main className="flex flex-col items-center gap-8 px-4 text-center">
        {/* Gradient Orb */}
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 opacity-80 blur-sm" />
          <div className="relative h-full w-full rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500" />
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Create Beautiful Screen Recordings
            <br />
            <span className="text-muted-foreground">
              without leaving your browser
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            100% Free - No installation or account needed.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="lg" className="gap-2">
            <HugeiconsIcon icon={PlayCircleIcon} strokeWidth={2} />
            Try Demo
          </Button>
          <Button size="lg" className="gap-2" onClick={handleShareScreen}>
            <HugeiconsIcon icon={RecordIcon} strokeWidth={2} />
            Share Screen
          </Button>
        </div>

        {/* Privacy note */}
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <HugeiconsIcon icon={LockIcon} strokeWidth={2} className="h-4 w-4" />
          Your recordings never leave your device
        </p>
      </main>
    </div>
  );
}
