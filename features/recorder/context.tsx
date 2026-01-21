"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface RecordingContextType {
  recordedBlob: Blob | null;
  setRecordedBlob: (blob: Blob | null) => void;
}

const RecordingContext = createContext<RecordingContextType | null>(null);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  return (
    <RecordingContext.Provider value={{ recordedBlob, setRecordedBlob }}>
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
