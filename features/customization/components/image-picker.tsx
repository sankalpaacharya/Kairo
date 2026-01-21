"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface WallpaperImage {
  name: string;
  path: string;
}

interface ImagePickerProps {
  selected: string | null;
  onSelect: (path: string) => void;
}

export function ImagePicker({ selected, onSelect }: ImagePickerProps) {
  const [images, setImages] = useState<WallpaperImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch("/api/wallpapers");
        const data = await res.json();
        setImages(data.images || []);
      } catch (error) {
        console.error("Error fetching wallpapers:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        Loading images...
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        No images found in /public/landscape
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">Images</h4>
      <div className="grid grid-cols-2 gap-2">
        {images.map((image) => (
          <button
            key={image.name}
            onClick={() => onSelect(image.path)}
            className={`
              relative aspect-video rounded-lg overflow-hidden transition-all
              ${selected === image.path ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : "hover:scale-105"}
            `}
          >
            <Image
              src={image.path}
              alt={image.name}
              fill
              className="object-cover"
              sizes="120px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
