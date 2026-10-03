"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { useSolarStore } from "../store/useSolarStore";

/**
 * OrbitRing renders an anti-aliased thin circular trajectory for a planet.
 * Uses a double-sided thin ring geometry for smooth rendering across all GPUs.
 */
export function OrbitRing({ distance, color = "#ffffff", isSelected = false, isHovered = false }) {
  const showOrbits = useSolarStore((state) => state.showOrbits);

  const ringGeo = useMemo(() => {
    // Inner and outer radius create a clean, thin track line
    const thickness = isSelected || isHovered ? 0.09 : 0.05;
    return new THREE.RingGeometry(distance - thickness, distance + thickness, 128);
  }, [distance, isSelected, isHovered]);

  if (!showOrbits) return null;

  const opacity = isSelected ? 0.65 : isHovered ? 0.45 : 0.18;
  const ringColor = isSelected || isHovered ? color : "#ffffff";

  return (
    <mesh geometry={ringGeo} rotation={[-Math.PI / 2, 0, 0]}>
      <meshBasicMaterial
        color={ringColor}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
