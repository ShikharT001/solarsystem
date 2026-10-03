import * as Astronomy from "astronomy-engine";
import { BODIES_DATA } from "../data/bodies";

/**
 * Calculates the heliocentric orbital angle and coordinates of planets for a given Date.
 * Translates true astronomical ecliptic longitude into our scene's artistic scale.
 *
 * @param {Date} date
 * @returns {Record<string, { angle: number, x: number, z: number, auDistance: number }>}
 */
export function getHeliocentricPositions(date = new Date()) {
  const result = {};

  try {
    for (const body of BODIES_DATA) {
      if (body.id === "sun") {
        result.sun = { angle: 0, x: 0, z: 0, auDistance: 0 };
        continue;
      }

      if (body.id === "moon") {
        // Moon is calculated geocentrically relative to Earth
        try {
          const geoVec = Astronomy.GeoVector("Moon", date, false);
          const ecl = Astronomy.Ecliptic(geoVec);
          const angleRad = (ecl.elon * Math.PI) / 180;
          result.moon = {
            angle: angleRad,
            x: Math.cos(angleRad) * body.orbitDistance,
            z: Math.sin(angleRad) * body.orbitDistance,
            auDistance: ecl.vec ? Math.sqrt(ecl.vec.x ** 2 + ecl.vec.y ** 2 + ecl.vec.z ** 2) : 0.00257,
          };
        } catch {
          result.moon = {
            angle: 0,
            x: body.orbitDistance,
            z: 0,
            auDistance: 0.00257,
          };
        }
        continue;
      }

      if (body.astronomyKey) {
        try {
          const helioVec = Astronomy.HelioVector(body.astronomyKey, date);
          const ecl = Astronomy.Ecliptic(helioVec);
          const angleRad = (ecl.elon * Math.PI) / 180;

          result[body.id] = {
            angle: angleRad,
            x: Math.cos(angleRad) * body.orbitDistance,
            z: Math.sin(angleRad) * body.orbitDistance,
            auDistance: Math.sqrt(helioVec.x ** 2 + helioVec.y ** 2 + helioVec.z ** 2),
          };
        } catch {
          const fallbackAngle = (body.orbitDistance * 1.618) % (Math.PI * 2);
          result[body.id] = {
            angle: fallbackAngle,
            x: Math.cos(fallbackAngle) * body.orbitDistance,
            z: Math.sin(fallbackAngle) * body.orbitDistance,
            auDistance: 1.0,
          };
        }
      }
    }
  } catch (err) {
    console.error("Ephemeris computation error:", err);
  }

  return result;
}
