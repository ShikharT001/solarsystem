import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`NASA API returned status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      title: data.title || "Astronomy Picture of the Day",
      date: data.date,
      explanation: data.explanation,
      url: data.url,
      hdurl: data.hdurl || data.url,
      media_type: data.media_type || "image",
      copyright: data.copyright || "NASA / Public Domain",
    });
  } catch (error) {
    console.warn("NASA APOD API route encountered error, using deep space archive:", error?.message);
    return NextResponse.json({
      success: true,
      source: "NASA Deep Space Archive (Fallback)",
      title: "NASA Deep Space Exploration: Vera Rubin Ridge",
      date: new Date().toISOString().slice(0, 10),
      explanation:
        "On sol 1943 of its journey across Mars, NASA's Curiosity Rover recorded this panoramic vista at Vera Rubin Ridge. NASA's planetary exploration fleet continues to uncover discoveries across our solar system.",
      url: "https://images-assets.nasa.gov/image/PIA14417/PIA14417~orig.jpg",
      hdurl: "https://images-assets.nasa.gov/image/PIA14417/PIA14417~orig.jpg",
      media_type: "image",
      copyright: "NASA / JPL-Caltech / MSSS",
    });
  }
}
