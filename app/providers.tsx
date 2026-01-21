"use client";

import type { ReactNode } from "react";
import { RecordingProvider } from "@/features/recorder/context";

export function Providers({ children }: { children: ReactNode }) {
  return <RecordingProvider>{children}</RecordingProvider>;
}
