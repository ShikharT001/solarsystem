"use client";

import React, { Suspense, useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, Loader } from "@react-three/drei";
import { MAJOR_PLANETS } from "../data/bodies";
import { Sun } from "./Sun";
import { Planet } from "./Planet";
import { AsteroidBelt } from "./AsteroidBelt";
import { OrbitRing } from "./OrbitRing";
import { CameraRig } from "./CameraRig";
import { getHeliocentricPositions } from "../lib/ephemeris";
import { useSolarStore } from "../store/useSolarStore";

/**
 * SolarSystem master 3D canvas integrating:
 * - High performance WebGL Canvas with anti-aliasing
 * - Cosmic Starfield via Drei's <Stars />
 * - Central Sun and major planets with nested satellites
 * - Live real-time ephemeris orbital alignment
 * - Dynamic camera rig with zero-jump tracking
 * - Empty-space click-to-reset interaction
 * - Drei's asset loader progress screen
 */
export function SolarSystem() {
  const [isMobile, setIsMobile] = useState(false);

  const resetOverview = useSolarStore((state) => state.resetOverview);
  const liveMode = useSolarStore((state) => state.liveMode);
  const selectedDate = useSolarStore((state) => state.selectedDate);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute live ephemeris positions when liveMode is active
  const ephemerisData = useMemo(() => {
    if (!liveMode) return {};
    const targetDate = selectedDate ? new Date(selectedDate) : new Date();
    return getHeliocentricPositions(targetDate);
  }, [liveMode, selectedDate]);

  return (
    <div className="relative w-full h-full min-h-screen bg-[#030308] overflow-hidden select-none">
      <Canvas
        camera={{
          position: [0, 65, 105],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onPointerMissed={() => resetOverview()}
      >
        {/* Deep space background tone */}
        <color attach="background" args={["#030308"]} />

        {/* Ambient illumination for planet shadow details */}
        <ambientLight intensity={0.16} />

        {/* Vast cosmic starfield */}
        <Stars
          radius={300}
          depth={60}
          count={6000}
          factor={6}
          saturation={0}
          fade={true}
          speed={0.8}
        />

        {/* Suspense boundary for asynchronous model & texture loading */}
        <Suspense fallback={null}>
          {/* Central Sun */}
          <Sun isMobile={isMobile} />

          {/* Planetary trajectories and celestial bodies */}
          {MAJOR_PLANETS.map((planet) => (
            <React.Fragment key={planet.id}>
              <OrbitRing
                distance={planet.orbitDistance}
                color={planet.color}
              />
              <Planet
                planet={planet}
                isMobile={isMobile}
                ephemerisAngle={liveMode && ephemerisData[planet.id] ? ephemerisData[planet.id].angle : null}
              />
            </React.Fragment>
          ))}

          {/* Main Asteroid Belt (2,500 instanced rocks between Mars & Jupiter) + Ceres */}
          <AsteroidBelt isMobile={isMobile} />

          {/* Camera controls & smooth tracking rig */}
          <CameraRig />
        </Suspense>
      </Canvas>

      {/* Drei's asset loader progress screen */}
      <Loader
        containerStyles={{
          background: "radial-gradient(circle at center, #0b1120 0%, #030308 100%)",
          zIndex: 50,
        }}
        innerStyles={{
          width: 220,
          height: 4,
          background: "#1e293b",
          borderRadius: 9999,
        }}
        barStyles={{
          background: "linear-gradient(90deg, #06b6d4, #3b82f6, #ec4899)",
          height: 4,
          borderRadius: 9999,
        }}
        dataStyles={{
          color: "#94a3b8",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          marginTop: "16px",
        }}
        dataInterpolation={(p) => `INITIALIZING SOLAR SYSTEM: ${p.toFixed(0)}%`}
      />
    </div>
  );
}

export default SolarSystem;
