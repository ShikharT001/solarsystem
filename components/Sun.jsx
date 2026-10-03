"use client";

import React, { useRef, useEffect } from "react";
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
 * Sun component positioned at the center of the solar system.
 * Features GLB model support (with procedural emissive sphere fallback),
 * central omnidirectional pointLight, layered corona glow meshes, and focus support.
 */
export function Sun({ isMobile = false }) {
  const sunGroupRef = useRef();
  const sunMeshRef = useRef();

  const sunData = BODIES_MAP.sun;
  const selectedId = useSolarStore((state) => state.selectedId);
  const focusBody = useSolarStore((state) => state.focusBody);
  const hoveredId = useSolarStore((state) => state.hoveredId);
  const setHoveredId = useSolarStore((state) => state.setHoveredId);
  const speed = useSolarStore((state) => state.speed);
  const isPaused = useSolarStore((state) => state.isPaused);

  const isSelected = selectedId === "sun";
  const isHovered = hoveredId === "sun";

  const segments = isMobile ? 36 : 64;

  useEffect(() => {
    registerPlanetRef("sun", sunGroupRef);
    return () => unregisterPlanetRef("sun");
  }, []);

  useFrame((_, delta) => {
    if (sunMeshRef.current) {
      const rotSpeed = isPaused ? 0.02 : 0.05 * speed;
      sunMeshRef.current.rotation.y += delta * rotSpeed;
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    setHoveredId("sun");
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "auto";
    setHoveredId(null);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    focusBody("sun");
  };

  return (
    <group ref={sunGroupRef} position={[0, 0, 0]}>
      {/* Primary solar illuminator with natural warm falloff */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2800}
        distance={600}
        decay={1.2}
        color="#fffaf0"
      />

      {/* Sun model / emissive sphere */}
      <group
        ref={sunMeshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <BodyModel
          body={sunData}
          segments={segments}
          isFocused={isSelected}
        />
      </group>

      {/* Subtle inner corona glow */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[sunData.radius, 32, 32]} />
        <meshBasicMaterial
          color="#ffa500"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle outer atmospheric corona glow */}
      <mesh scale={[1.25, 1.25, 1.25]}>
        <sphereGeometry args={[sunData.radius, 32, 32]} />
        <meshBasicMaterial
          color="#ff7700"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Hover / Selected Label */}
      {(isHovered || isSelected) && (
        <Html
          position={[0, sunData.radius + 1.2, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/85 text-amber-200 border border-amber-500/40 backdrop-blur-md shadow-[0_0_20px_rgba(255,170,0,0.4)] text-xs font-semibold whitespace-nowrap select-none animate-in fade-in zoom-in-95 duration-150">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Sun (Star)
          </div>
        </Html>
      )}
    </group>
  );
}
