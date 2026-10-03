"use client";

import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { BodyModel } from "./BodyModel";
import { SaturnRing } from "./SaturnRing";
import { Moon } from "./Moon";
import {
  useSolarStore,
  registerPlanetRef,
  unregisterPlanetRef,
} from "../store/useSolarStore";

/**
 * Planet component rendering an individual celestial body with:
 * - Real 3D GLB model loading via BodyModel (falling back to textured sphere)
 * - Real-time orbital motion and live ephemeris alignment
 * - Axial obliquity tilt and diurnal rotation
 * - Nested subsystems (Saturn's rings, Earth's Moon)
 * - Pointer interactions and status badges
 */
export function Planet({ planet, isMobile = false, ephemerisAngle = null }) {
  const orbitGroupRef = useRef();
  const tiltGroupRef = useRef();
  const bodyMeshRef = useRef();

  // Initialize starting angle (from ephemeris if available, or deterministic spread)
  const orbitAngle = useRef(
    ephemerisAngle !== null
      ? ephemerisAngle
      : (planet.orbitDistance * 1.618) % (Math.PI * 2)
  );

  const selectedId = useSolarStore((state) => state.selectedId);
  const focusBody = useSolarStore((state) => state.focusBody);
  const hoveredId = useSolarStore((state) => state.hoveredId);
  const setHoveredId = useSolarStore((state) => state.setHoveredId);
  const speed = useSolarStore((state) => state.speed);
  const isPaused = useSolarStore((state) => state.isPaused);
  const liveMode = useSolarStore((state) => state.liveMode);

  const isSelected = selectedId === planet.id;
  const isHovered = hoveredId === planet.id;

  const segments = isMobile ? 32 : 64;

  useEffect(() => {
    registerPlanetRef(planet.id, orbitGroupRef);
    return () => unregisterPlanetRef(planet.id);
  }, [planet.id]);

  // When liveMode ephemerisAngle updates, align position immediately
  useEffect(() => {
    if (liveMode && ephemerisAngle !== null) {
      orbitAngle.current = ephemerisAngle;
      if (orbitGroupRef.current) {
        orbitGroupRef.current.position.x = Math.cos(ephemerisAngle) * planet.orbitDistance;
        orbitGroupRef.current.position.z = Math.sin(ephemerisAngle) * planet.orbitDistance;
      }
    }
  }, [liveMode, ephemerisAngle, planet.orbitDistance]);

  // Initial position set
  useEffect(() => {
    if (orbitGroupRef.current) {
      orbitGroupRef.current.position.x = Math.cos(orbitAngle.current) * planet.orbitDistance;
      orbitGroupRef.current.position.z = Math.sin(orbitAngle.current) * planet.orbitDistance;
    }
  }, [planet.orbitDistance]);

  useFrame((_, delta) => {
    // 1. Orbital revolution around the central Sun
    if (!isPaused && orbitGroupRef.current) {
      orbitAngle.current += delta * planet.orbitSpeed * 0.12 * speed;
      const angle = orbitAngle.current;
      const dist = planet.orbitDistance;

      orbitGroupRef.current.position.x = Math.cos(angle) * dist;
      orbitGroupRef.current.position.z = Math.sin(angle) * dist;
    }

    // 2. Axial rotation around tilted local axis
    if (bodyMeshRef.current) {
      const rotMultiplier = isPaused ? 0.3 : 1.0;
      bodyMeshRef.current.rotation.y += delta * planet.rotationSpeed * 5 * speed * rotMultiplier;
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    setHoveredId(planet.id);
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "auto";
    setHoveredId(null);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    focusBody(planet.id);
  };

  return (
    <group ref={orbitGroupRef}>
      {/* Tilted orientation group matching axial obliquity */}
      <group ref={tiltGroupRef} rotation={[0, 0, planet.axialTilt || 0]}>
        {/* Planet 3D Model / Fallback Sphere */}
        <group
          ref={bodyMeshRef}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <BodyModel
            body={planet}
            segments={segments}
            isFocused={isSelected}
          />
        </group>

        {/* Saturn's Ring System */}
        {planet.ring && (
          <SaturnRing
            innerRadius={planet.ring.innerRadius}
            outerRadius={planet.ring.outerRadius}
            textureUrl={planet.ring.texture}
            color={planet.ring.color}
            opacity={planet.ring.opacity}
          />
        )}

        {/* Earth's Moon Subsystem */}
        {planet.id === "earth" && (
          <Moon isMobile={isMobile} />
        )}
      </group>

      {/* Floating Hover & Selection Indicator Label */}
      {(isHovered || isSelected) && (
        <Html
          position={[0, planet.radius + (isMobile ? 1.0 : 0.8), 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shadow-lg backdrop-blur-md border transition-all duration-200 select-none ${
              isSelected
                ? "bg-cyan-950/90 text-cyan-200 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] ring-1 ring-cyan-400/50"
                : "bg-zinc-900/85 text-zinc-200 border-zinc-700/60"
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: planet.color }}
            />
            {planet.name}
          </div>
        </Html>
      )}
    </group>
  );
}
