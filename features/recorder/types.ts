export type RecordingState = "idle" | "recording" | "paused" | "stopped";

export interface RecorderState {
  recordingState: RecordingState;
  recordedBlob: Blob | null;
  stream: MediaStream | null;
}
