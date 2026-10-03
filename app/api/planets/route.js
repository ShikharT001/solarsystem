import { NextResponse } from "next/server";
import { BODIES_MAP } from "@/data/bodies";

// Cache for 24 hours (86,400 seconds)
export const revalidate = 86400;

export async function GET() {
  const headers = {};
  if (process.env.SOLAR_API_KEY) {
    headers["Authorization"] = `Bearer ${process.env.SOLAR_API_KEY}`;
  }

  try {
    const res = await fetch("https://api.le-systeme-solaire.net/rest/bodies/", {
      headers,
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data = await res.json();
      const bodiesList = data.bodies || [];

      // Map API bodies to our IDs
      const mapped = {};
      const idLookup = {
        soleil: "sun",
        mercure: "mercury",
        venus: "venus",
        terre: "earth",
        lune: "moon",
        mars: "mars",
        jupiter: "jupiter",
        saturne: "saturn",
        uranus: "uranus",
        neptune: "neptune",
        pluton: "pluto",
      };

      for (const item of bodiesList) {
        const mappedId = idLookup[item.id?.toLowerCase()] || item.englishName?.toLowerCase();
        if (mappedId && BODIES_MAP[mappedId]) {
          mapped[mappedId] = {
            id: mappedId,
            englishName: item.englishName,
            meanRadius: item.meanRadius,
            semimajorAxis: item.semimajorAxis,
            sideralOrbit: item.sideralOrbit,
            sideralRotation: item.sideralRotation,
            gravity: item.gravity,
            moonsCount: item.moons ? item.moons.length : 0,
            density: item.density,
            avgTemp: item.avgTemp,
            discoveredBy: item.discoveredBy || "Known since antiquity",
            discoveryDate: item.discoveryDate || "Ancient",
          };
        }
      }

      return NextResponse.json({
        success: true,
        source: "api.le-systeme-solaire.net",
        bodies: mapped,
      });
    }
  } catch (error) {
    console.warn("Solar System API fetch failed, falling back to local dataset:", error?.message);
  }

  // Graceful fallback to verified local dataset
  const localFallback = {};
  for (const [id, body] of Object.entries(BODIES_MAP)) {
    localFallback[id] = {
      id,
      englishName: body.name,
      meanRadius: body.info.diameter ? parseFloat(body.info.diameter.replace(/,/g, "")) / 2 : null,
      semimajorAxis: body.info.distanceFromSun,
      sideralOrbit: body.info.orbitalPeriod,
      sideralRotation: body.info.rotationPeriod,
      moonsCount: typeof body.info.moons === "number" ? body.info.moons : 0,
      avgTemp: body.info.surfaceTemp,
      discoveredBy: "Historical records",
      discoveryDate: "Ancient",
    };
  }

  return NextResponse.json({
    success: true,
    source: "local-fallback",
    bodies: localFallback,
  });
}
