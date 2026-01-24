"use client";

import { useState, useRef, useCallback } from "react";
import { type CropArea } from "@/features/recorder/components/video-preview";

export interface ExportOptions {
    background: { colors: string[]; id: string } | null;
    backgroundImage: string | null;
    padding: number;
    cropArea: CropArea | null;
    trimStart: number;
    trimEnd: number;
    aspectRatio: string;
    fileName?: string;
}

interface UseVideoExportReturn {
    isExporting: boolean;
    exportProgress: number;
    exportVideo: (video: HTMLVideoElement, options: ExportOptions) => Promise<void>;
    cancelExport: () => void;
}

export function useVideoExport(): UseVideoExportReturn {
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const cancelRef = useRef(false);

    const exportVideo = useCallback(async (video: HTMLVideoElement, options: ExportOptions) => {
        if (!("VideoEncoder" in window)) {
            alert("WebCodecs not supported in this browser.");
            return;
        }

        setIsExporting(true);
        setExportProgress(0);
        cancelRef.current = false;

        const { background, backgroundImage, padding, cropArea, trimStart, trimEnd, aspectRatio, fileName = "edited-recording" } = options;

        const originalCurrentTime = video.currentTime;
        const wasPlaying = !video.paused;

        let animationFrameId: number | null = null;

        try {
            const duration = video.duration;
            const start = Math.max(0, trimStart);
            const end = trimEnd > 0 ? Math.min(trimEnd, duration) : duration;
            const exportDuration = end - start;

            if (exportDuration <= 0) throw new Error("Invalid trim range");

            video.pause();

            // --- Canvas setup (720p max)
            const scale = Math.min(1, 720 / video.videoHeight);
            const canvas = document.createElement("canvas");
            canvas.width = Math.floor(video.videoWidth * scale);
            canvas.height = Math.floor(video.videoHeight * scale);
            const ctx = canvas.getContext("2d", { alpha: false });
            if (!ctx) throw new Error("Canvas failed");

            // --- Background image
            let bgImg: HTMLImageElement | null = null;
            if (backgroundImage) {
                bgImg = new Image();
                bgImg.crossOrigin = "anonymous";
                await new Promise<void>((resolve, reject) => {
                    bgImg!.onload = () => resolve();
                    bgImg!.onerror = () => reject();
                    bgImg!.src = backgroundImage;
                }).catch(() => (bgImg = null));
            }

            // --- Crop
            const srcX = cropArea ? (cropArea.x / 100) * video.videoWidth : 0;
            const srcY = cropArea ? (cropArea.y / 100) * video.videoHeight : 0;
            const srcW = cropArea ? (cropArea.width / 100) * video.videoWidth : video.videoWidth;
            const srcH = cropArea ? (cropArea.height / 100) * video.videoHeight : video.videoHeight;
            const pad = padding;
            const availW = canvas.width - pad * 2;
            const availH = canvas.height - pad * 2;
            const srcRatio = srcW / srcH;
            const dstRatio = availW / availH;

            let drawW: number, drawH: number;
            if (srcRatio > dstRatio) {
                drawW = availW;
                drawH = availW / srcRatio;
            } else {
                drawH = availH;
                drawW = availH * srcRatio;
            }
            const drawX = pad + (availW - drawW) / 2;
            const drawY = pad + (availH - drawH) / 2;

            const drawFrame = () => {
                if (bgImg) {
                    const scaleBg = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
                    const x = (canvas.width - bgImg.width * scaleBg) / 2;
                    const y = (canvas.height - bgImg.height * scaleBg) / 2;
                    ctx.drawImage(bgImg, x, y, bgImg.width * scaleBg, bgImg.height * scaleBg);
                } else if (background) {
                    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                    g.addColorStop(0, background.colors[0]);
                    g.addColorStop(1, background.colors[1]);
                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                } else {
                    ctx.fillStyle = "#ff0000"; // red default
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(video, srcX, srcY, srcW, srcH, drawX, drawY, drawW, drawH);
            };

            // --- Setup WebCodecs
            const frames: VideoFrame[] = [];
            const encoder = new VideoEncoder({
                output: chunk => frames.push(chunk), // we will assemble later
                error: e => console.error(e),
            });

            encoder.configure({
                codec: "vp9",
                width: canvas.width,
                height: canvas.height,
                bitrate: 5_000_000,
                framerate: 30,
            });

            video.currentTime = start;
            await new Promise<void>(res => video.addEventListener("seeked", res, { once: true }));
            await video.play();

            const startTime = performance.now();

            const renderLoop = () => {
                if (cancelRef.current || video.currentTime >= end || video.ended) {
                    encoder.close();
                    video.pause();
                    return;
                }

                drawFrame();
                const frame = new VideoFrame(canvas, { timestamp: video.currentTime * 1_000_000 }); // microseconds
                encoder.encode(frame);
                frame.close();

                const progress = Math.min(100, ((video.currentTime - start) / exportDuration) * 100);
                setExportProgress(Math.round(progress));

                animationFrameId = requestAnimationFrame(renderLoop);
            };

            renderLoop();

            // Wait until video reaches the end
            await new Promise<void>(resolve => {
                const checkEnd = () => {
                    if (video.currentTime >= end || video.ended || cancelRef.current) resolve();
                    else requestAnimationFrame(checkEnd);
                };
                checkEnd();
            });

            // --- Assemble WebM
            const webmBlob = new Blob(frames, { type: "video/webm" });
            const url = URL.createObjectURL(webmBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${fileName.replace(/\s+/g, "-")}.webm`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Export failed");
        } finally {
            animationFrameId && cancelAnimationFrame(animationFrameId);
            video.currentTime = originalCurrentTime;
            if (wasPlaying) video.play().catch(() => { });
            setIsExporting(false);
            setExportProgress(0);
        }
    }, []);

    const cancelExport = useCallback(() => {
        cancelRef.current = true;
    }, []);

    return { isExporting, exportProgress, exportVideo, cancelExport };
}
