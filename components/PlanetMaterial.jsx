"use client";

import React, { Component, Suspense } from "react";
import { useTexture } from "@react-three/drei";

/**
 * React Error Boundary that catches texture loading rejections (such as missing 404 files)
 * and falls back to a solid color meshStandardMaterial so the WebGL scene never crashes.
 */
class TextureErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn(
      `[SolarSystem] Texture failed to load (${this.props.url || "unknown"}). Falling back to solid color material.`
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
 * Inner component that loads the texture using Drei's useTexture hook.
 * Suspends while the image is downloading and processing.
 */
function TexturedMaterial({
  url,
  color,
  roughness,
  metalness,
  emissive,
  emissiveIntensity,
  transparent,
  opacity,
}) {
  const texture = useTexture(url);

  return (
    <meshStandardMaterial
      map={texture}
      color={color || "#ffffff"}
      roughness={roughness}
      metalness={metalness}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      transparent={transparent}
      opacity={opacity}
    />
  );
}

/**
 * Resilient Material wrapper. If the texture is missing or loading,
 * it immediately provides a fallback solid-colored material.
 */
export function PlanetMaterial({
  textureUrl,
  color = "#888888",
  roughness = 0.7,
  metalness = 0.1,
  emissive = "#000000",
  emissiveIntensity = 0,
  transparent = false,
  opacity = 1.0,
}) {
  const fallbackMaterial = (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      transparent={transparent}
      opacity={opacity}
    />
  );

  if (!textureUrl) {
    return fallbackMaterial;
  }

  return (
    <TextureErrorBoundary fallback={fallbackMaterial} url={textureUrl}>
      <Suspense fallback={fallbackMaterial}>
        <TexturedMaterial
          url={textureUrl}
          roughness={roughness}
          metalness={metalness}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          transparent={transparent}
          opacity={opacity}
        />
      </Suspense>
    </TextureErrorBoundary>
  );
}
