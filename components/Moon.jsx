"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { BODIES_MAP } from "../data/bodies";
import { BodyModel } from "./BodyModel";
import {
  useSolarStore,
  registerPlanetRef,
  unregisterPlanetRef,
} from "../store/useSolarStore";

/**
 * Moon component orbiting Earth with:
 * - GLB 3D model support (with automatic textured sphere fallback)
 * - Tidal locking: same celestial face permanently points toward Earth
 * - Full selection & camera tracking as a standalone focusable body
 * - Anti-aliased orbital ring around Earth
 */
export function Moon({ isMobile = false, initialAngle = 0 }) {
  const moonGroupRef = useRef();
  const orbitAngle = useRef(initialAngle || Math.random() * Math.PI * 2);

  const selectedId = useSolarStore((state) => state.selectedId);
  const focusBody = useSolarStore((state) => state.focusBody);
  const hoveredId = useSolarStore((state) => state.hoveredId);
  const setHoveredId = useSolarStore((state) => state.setHoveredId);
  const speed = useSolarStore((state) => state.speed);
  const isPaused = useSolarStore((state) => state.isPaused);
  const showOrbits = useSolarStore((state) => state.showOrbits);

  const moonData = BODIES_MAP.moon;
  const isSelected = selectedId === "moon";
  const isHovered = hoveredId === "moon";

  const distance = moonData?.orbitDistance || 2.8;
  const segments = isMobile ? 24 : 36;

  useEffect(() => {
    registerPlanetRef("moon", moonGroupRef);
    return () => unregisterPlanetRef("moon");
  }, []);

  // Thin circular orbit ring around Earth
  const orbitRingGeo = useMemo(() => {
    return new THREE.RingGeometry(distance - 0.02, distance + 0.02, 64);
  }, [distance]);

  useFrame((_, delta) => {
    if (!isPaused && moonGroupRef.current) {
      orbitAngle.current += delta * (moonData.orbitSpeed || 1.8) * 0.4 * speed;
      const angle = orbitAngle.current;

      // Update orbital position around Earth
      moonGroupRef.current.position.x = Math.cos(angle) * distance;
      moonGroupRef.current.position.z = Math.sin(angle) * distance;

      // Tidal Locking: Orient the Moon so its primary face continually looks at Earth [0, 0, 0]
      moonGroupRef.current.lookAt(0, 0, 0);
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    setHoveredId("moon");
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "auto";
    setHoveredId(null);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    focusBody("moon");
  };

  return (
    <group>
      {/* Moon's orbit ring around Earth */}
      {showOrbits && (
        <mesh geometry={orbitRingGeo} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={isSelected ? 0.5 : 0.12}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Moon celestial body group */}
      <group
        ref={moonGroupRef}
        position={[distance, 0, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <BodyModel
          body={moonData}
          segments={segments}
          isFocused={isSelected}
        />

        {/* Floating Hover & Selection Indicator Label */}
        {(isHovered || isSelected) && (
          <Html
            position={[0, moonData.radius + 0.6, 0]}
            center
            style={{ pointerEvents: "none" }}
          >
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap shadow-md backdrop-blur-md border transition-all duration-150 select-none ${
                isSelected
                  ? "bg-cyan-950/90 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                  : "bg-zinc-900/85 text-zinc-300 border-zinc-700/60"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              Moon (Satellite)
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
