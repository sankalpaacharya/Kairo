"use client";

import { useState, useRef, useCallback } from "react";
import type { RecordingState } from "../types";
import { useRecordingContext } from "../context";

interface UseMediaRecorderReturn {
  recordingState: RecordingState;
  recordedBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  reset: () => void;
}

export function useMediaRecorder(): UseMediaRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("");
  const { setRecordedBlob: setContextRecordedBlob } = useRecordingContext();

  const getSupportedMimeType = () => {
    // Prioritize codecs that are more widely supported
    const types = [
      "video/webm;codecs=vp8,opus", // Best compatibility
      "video/webm;codecs=vp9,opus", // Better quality
      "video/webm;codecs=vp8",
      "video/webm;codecs=vp9",
      "video/webm;codecs=h264",
      "video/webm",
      "video/mp4",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" },
        audio: true,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        console.error("No supported MIME type found for recording");
        alert("Your browser doesn't support video recording. Please try Chrome or Edge.");
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      mimeTypeRef.current = mimeType;
      console.log(`Using MIME type: ${mimeType}`); // FIXED: Added opening parenthesis

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps for better quality
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });

        // Validate blob
        if (blob.size === 0) {
          console.error("Recording failed: blob is empty");
          setRecordingState("idle");
          return;
        }

        console.log(`Recording complete: ${blob.size} bytes, type: ${blob.type}`);
        setRecordedBlob(blob);
        setContextRecordedBlob(blob, mimeTypeRef.current);
        setRecordingState("stopped");

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setRecordingState("idle");
      };

      // Handle when user stops sharing via browser UI
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          if (mediaRecorderRef.current?.state !== "inactive") {
            mediaRecorderRef.current?.stop();
          }
        };
      }

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms for smoother recording
      setRecordingState("recording");
    } catch (err) {
      console.error("Error starting recording:", err);
      setRecordingState("idle");

      // User-friendly error messages
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          alert("Screen recording permission was denied. Please allow screen sharing to record.");
        } else if (err.name === "NotFoundError") {
          alert("No screen to record was found.");
        } else {
          alert(`Recording failed: ${err.message}`);
        }
      }
    }
  }, [setContextRecordedBlob]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState("paused");
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState("recording");
    }
  }, []);

  const reset = useCallback(() => {
    // Stop any ongoing recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setRecordedBlob(null);
    setContextRecordedBlob(null, null);
    setRecordingState("idle");
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    streamRef.current = null;
    mimeTypeRef.current = "";
  }, [setContextRecordedBlob]);

  return {
    recordingState,
    recordedBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
  };
}