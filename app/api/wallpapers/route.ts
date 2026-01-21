import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const landscapeDir = path.join(process.cwd(), "public", "landscape");

  try {
    const files = fs.readdirSync(landscapeDir);
    const images = files
      .filter((file) => /\.(png|jpg|jpeg|webp|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        path: `/landscape/${file}`,
      }));

    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
