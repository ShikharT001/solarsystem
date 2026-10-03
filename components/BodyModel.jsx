"use client";

import React, { Component, Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { MODEL_REGISTRY } from "../data/models";
import { PlanetMaterial } from "./PlanetMaterial";

/**
 * Normalizes any 3D GLB model to exact target sphere radius
 * by computing its world bounding box, centering its pivot,
 * and scaling proportionally so varied unit models fit accurately.
 */
export function normalizeModel(scene, targetRadius, scaleMultiplier = 1.0, rotationOffset = [0, 0, 0]) {
  const cloned = scene.clone(true);

  // Compute exact bounding dimensions
  const box = new THREE.Box3().setFromObject(cloned);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // Recenter pivot to [0, 0, 0]
  cloned.position.sub(center);

  // Target diameter is targetRadius * 2
  const maxDim = Math.max(size.x, size.y, size.z);
  const scaleFactor = maxDim > 0 ? (targetRadius * 2) / maxDim : 1;
  cloned.scale.setScalar(scaleFactor * scaleMultiplier);

  // Apply manual rotational adjustment
  if (rotationOffset && rotationOffset.length === 3) {
    cloned.rotation.set(rotationOffset[0], rotationOffset[1], rotationOffset[2]);
  }

  // Ensure all mesh components interact correctly with lights
  cloned.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
      if (node.material) {
        node.material.roughness = node.material.roughness ?? 0.6;
        node.material.metalness = node.material.metalness ?? 0.1;
      }
    }
  });

  return cloned;
}

/**
 * Error boundary that catches missing or corrupted GLB load failures
 * and seamlessly drops back to the textured sphere without crashing.
 */
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn(
      `[SolarSystem] GLB model failed to load for ${this.props.bodyId}. Falling back to textured sphere:`,
      error?.message || error
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Inner loader component using Drei's useGLTF
 */
function GLTFViewer({ modelConfig, targetRadius }) {
  const gltf = useGLTF(modelConfig.path);

  const normalizedScene = useMemo(() => {
    return normalizeModel(
      gltf.scene,
      targetRadius,
      modelConfig.scale || 1.0,
      modelConfig.rotationOffset || [0, 0, 0]
    );
  }, [gltf, targetRadius, modelConfig]);

  return <primitive object={normalizedScene} />;
}

/**
 * Preload helper: called only for the focused body and its natural satellites
 */
export function preloadBodyModel(bodyId) {
  const config = MODEL_REGISTRY[bodyId];
  if (config?.path) {
    try {
      useGLTF.preload(config.path);
    } catch {
      // Preload errors are silently swallowed
    }
  }
}

/**
 * Main BodyModel component:
 * - Attempts to load and display the GLB model from /public/models/
 * - Automatically falls back to textured sphere if file is missing or throws error
 */
export function BodyModel({ body, segments = 64, isFocused = false }) {
  const modelConfig = MODEL_REGISTRY[body.id];

  // Default fallback: textured sphere
  const fallbackSphere = (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[body.radius, segments, segments]} />
      <PlanetMaterial
        textureUrl={body.texture}
        color={body.color}
        roughness={body.roughness ?? 0.7}
        metalness={body.metalness ?? 0.1}
        emissive={body.emissive || "#000000"}
        emissiveIntensity={body.emissiveIntensity || 0}
      />
    </mesh>
  );

  // If no model configuration exists for this body, render fallback
  if (!modelConfig?.path) {
    return fallbackSphere;
  }

  return (
    <ModelErrorBoundary fallback={fallbackSphere} bodyId={body.id}>
      <Suspense fallback={fallbackSphere}>
        <GLTFViewer modelConfig={modelConfig} targetRadius={body.radius} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
