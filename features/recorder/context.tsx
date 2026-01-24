"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface RecordingContextType {
  recordedBlob: Blob | null;
  recordedMimeType: string | null;
  setRecordedBlob: (blob: Blob | null, mimeType?: string | null) => void;
}

const RecordingContext = createContext<RecordingContextType | null>(null);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [recordedBlob, setRecordedBlobState] = useState<Blob | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string | null>(null);

  const setRecordedBlob = (blob: Blob | null, mimeType?: string | null) => {
    setRecordedBlobState(blob);
    setRecordedMimeType(mimeType ?? null);
  };

  return (
    <RecordingContext.Provider value={{ recordedBlob, recordedMimeType, setRecordedBlob }}>
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecordingContext() {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error(
      "useRecordingContext must be used within RecordingProvider",
    );
  }
  return context;
}
