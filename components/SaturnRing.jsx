"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { PlanetMaterial } from "./PlanetMaterial";

/**
 * SaturnRing renders Saturn's magnificent ring system.
 * Modifies RingGeometry UV coordinates radially so that 1D/2D ring strip textures
 * map smoothly from inner radius to outer radius with realistic transparency.
 */
export function SaturnRing({
  innerRadius = 3.3,
  outerRadius = 6.2,
  textureUrl = "/textures/saturn_ring.png",
  color = "#d4be92",
  opacity = 0.88,
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 128, 8);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;

    // Reproject UVs radially so texture coordinates span [0, 1] from inner to outer boundary
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const u = Math.min(1, Math.max(0, (dist - innerRadius) / (outerRadius - innerRadius)));
      uv.setXY(i, u, 0.5);
    }
    uv.needsUpdate = true;
    return geo;
  }, [innerRadius, outerRadius]);

  return (
    // Rotate 90 degrees around X to lie flat on the planet's equatorial plane
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <PlanetMaterial
        textureUrl={textureUrl}
        color={color}
        roughness={0.7}
        metalness={0.05}
        transparent={true}
        opacity={opacity}
      />
    </mesh>
  );
}
