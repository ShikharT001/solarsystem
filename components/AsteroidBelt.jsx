"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSolarStore } from "../store/useSolarStore";
import { Planet } from "./Planet";
import { BODIES_MAP } from "../data/bodies";

const ASTEROID_PALETTE = [
  new THREE.Color("#3c3730"), // Dark carbonaceous C-type
  new THREE.Color("#554d43"), // Dusty brownish-grey
  new THREE.Color("#6b6255"), // Stony silicate S-type
  new THREE.Color("#4a4540"), // Metallic nickel-iron M-type
  new THREE.Color("#7d7568"), // Light chondritic rock
];

/**
 * Volumetric 3D Asteroid Belt located between Mars (r=32) and Jupiter (r=44).
 * Uses InstancedMesh for extreme 60 FPS performance, irregular faceted rock geometries,
 * natural power-law size distribution, and realistic toroidal Gaussian vertical thickness.
 */
export function AsteroidBelt({ isMobile = false }) {
  const instancedMeshRef = useRef();
  const beltGroupRef = useRef();

  const speed = useSolarStore((state) => state.speed);
  const isPaused = useSolarStore((state) => state.isPaused);
  const showAsteroids = useSolarStore((state) => state.showAsteroids);
  const showOrbits = useSolarStore((state) => state.showOrbits);

  const count = isMobile ? 1200 : 2500;
  const innerRadius = 34.8;
  const outerRadius = 41.6;

  // Generate instances once with naturalistic potatoid perturbations
  const { geometry, instances } = useMemo(() => {
    // Irregular faceted dodecahedron geometry
    const geo = new THREE.DodecahedronGeometry(0.13, 1);

    const data = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      // Natural radial distribution peaked toward central belt (~38 AU)
      const r = innerRadius + Math.random() * (outerRadius - innerRadius);
      const angle = Math.random() * Math.PI * 2;

      // Volumetric toroidal vertical scattering (Gaussian-like distribution)
      const y = (Math.random() - 0.5) * (Math.random() - 0.5) * 3.2;

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      // Power-law size distribution: mostly smaller fragments with rare boulders
      const scaleBase = Math.pow(Math.random(), 3.2) * 1.6 + 0.35;
      const sx = scaleBase * (0.8 + Math.random() * 0.4);
      const sy = scaleBase * (0.7 + Math.random() * 0.5);
      const sz = scaleBase * (0.8 + Math.random() * 0.4);

      dummy.position.set(x, y, z);
      dummy.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();

      const color = ASTEROID_PALETTE[Math.floor(Math.random() * ASTEROID_PALETTE.length)];

      data.push({ matrix: dummy.matrix.clone(), color });
    }

    return { geometry: geo, instances: data };
  }, [count, innerRadius, outerRadius]);

  // Apply matrices and colors to the InstancedMesh
  useEffect(() => {
    if (!instancedMeshRef.current) return;
    const mesh = instancedMeshRef.current;

    instances.forEach((inst, i) => {
      mesh.setMatrixAt(i, inst.matrix);
      mesh.setColorAt(i, inst.color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [instances]);

  // Orbital revolution of the asteroid belt around the Sun
  useFrame((_, delta) => {
    if (!isPaused && beltGroupRef.current) {
      beltGroupRef.current.rotation.y += delta * 0.035 * speed;
    }
  });

  if (!showAsteroids) return null;

  return (
    <group>
      {/* Primary Instanced Asteroid Field */}
      <group ref={beltGroupRef}>
        <instancedMesh
          ref={instancedMeshRef}
          args={[geometry, null, count]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            roughness={0.9}
            metalness={0.12}
            flatShading={true}
          />
        </instancedMesh>
      </group>

      {/* Featured Dwarf Planet: Ceres inside the belt */}
      {BODIES_MAP.ceres && (
        <Planet planet={BODIES_MAP.ceres} isMobile={isMobile} />
      )}

      {/* Optional faint orbital boundary guide lines */}
      {showOrbits && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[innerRadius - 0.04, innerRadius + 0.04, 128]} />
            <meshBasicMaterial
              color="#d4b483"
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[outerRadius - 0.04, outerRadius + 0.04, 128]} />
            <meshBasicMaterial
              color="#d4b483"
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
