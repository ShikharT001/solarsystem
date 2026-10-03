"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { BODIES_MAP } from "../data/bodies";
import { preloadBodyModel } from "./BodyModel";
import { useSolarStore, getPlanetRef } from "../store/useSolarStore";

// Static vectors reused across frames to prevent GC allocations
const tempCurrentPos = new THREE.Vector3();
const tempPrevBodyPos = new THREE.Vector3();
const tempDisplacement = new THREE.Vector3();
const tempDesiredCamPos = new THREE.Vector3();
const tempCamDir = new THREE.Vector3();
const overviewTarget = new THREE.Vector3(0, 0, 0);
const overviewPos = new THREE.Vector3(0, 65, 105);

/**
 * CameraRig handles:
 * 1. Cinematic fly-to lerp with zero jump when switching between celestial bodies
 * 2. 60 FPS orbit following using displacement vectors so user OrbitControls rotation/zoom is preserved
 * 3. Dynamic min/max camera distance limits to prevent clipping inside models while focused
 * 4. Model preloading strictly for the focused body and its natural satellites
 */
export function CameraRig() {
  const controlsRef = useRef();
  const { camera } = useThree();

  const selectedId = useSolarStore((state) => state.selectedId);
  const zoomLevel = useSolarStore((state) => state.zoomLevel);
  const focusedBody = selectedId ? BODIES_MAP[selectedId] : null;

  const isTransitioning = useRef(false);
  const hasInitializedBody = useRef(false);

  // When selected body changes, initiate smooth camera flight and preload models
  useEffect(() => {
    isTransitioning.current = true;
    hasInitializedBody.current = false;

    if (selectedId) {
      // Preload GLB model for selected body and any orbiting satellites
      preloadBodyModel(selectedId);
      const body = BODIES_MAP[selectedId];
      if (body?.moons) {
        body.moons.forEach((mId) => preloadBodyModel(mId));
      }
    }
  }, [selectedId]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    const lerpSpeed = Math.min(1.0, delta * 3.5);

    if (focusedBody) {
      // --- FOCUSED MODE ---
      // Configure zoom safety boundaries so user can zoom close without intersecting surface
      const targetMin = Math.max(0.5, focusedBody.radius * 1.5);
      const targetMax = Math.max(10, focusedBody.radius * 12.0);
      controlsRef.current.minDistance = targetMin;
      controlsRef.current.maxDistance = targetMax;

      const bodyGroupRef = getPlanetRef(focusedBody.id);

      if (bodyGroupRef?.current) {
        // Query celestial body's world coordinate
        bodyGroupRef.current.getWorldPosition(tempCurrentPos);

        // Calculate focus viewing distance factoring in UI zoom controls
        const baseDist = focusedBody.focusDistance || focusedBody.radius * 4.0;
        const desiredDist = THREE.MathUtils.clamp(
          baseDist * (zoomLevel || 1.0),
          targetMin,
          targetMax
        );

        if (!hasInitializedBody.current) {
          tempPrevBodyPos.copy(tempCurrentPos);
          hasInitializedBody.current = true;
        }

        if (isTransitioning.current) {
          // Smoothly animate OrbitControls target toward the body
          controlsRef.current.target.lerp(tempCurrentPos, lerpSpeed);

          // Compute smooth incoming vector
          tempCamDir.subVectors(camera.position, tempCurrentPos);
          if (tempCamDir.lengthSq() < 0.001) {
            tempCamDir.set(0.72, 0.45, 0.72);
          }
          tempCamDir.normalize();

          tempDesiredCamPos.copy(tempCurrentPos).addScaledVector(tempCamDir, desiredDist);
          camera.position.lerp(tempDesiredCamPos, lerpSpeed);

          // Conclude transition once close to target
          if (
            controlsRef.current.target.distanceTo(tempCurrentPos) < 0.15 &&
            camera.position.distanceTo(tempDesiredCamPos) < 0.3
          ) {
            isTransitioning.current = false;
          }
        } else {
          // --- FOLLOW ORBITING BODY WITHOUT JITTER ---
          // Compute displacement vector of the body since previous frame
          tempDisplacement.subVectors(tempCurrentPos, tempPrevBodyPos);

          // Translate camera position along with body's orbital motion
          camera.position.add(tempDisplacement);
          // Lock OrbitControls pivot to body
          controlsRef.current.target.copy(tempCurrentPos);

          // Apply UI zoom adjustments if requested
          const currentDist = camera.position.distanceTo(tempCurrentPos);
          if (Math.abs(currentDist - desiredDist) > 0.05) {
            tempCamDir.subVectors(camera.position, tempCurrentPos).normalize();
            tempDesiredCamPos.copy(tempCurrentPos).addScaledVector(tempCamDir, desiredDist);
            camera.position.lerp(tempDesiredCamPos, lerpSpeed);
          }
        }

        tempPrevBodyPos.copy(tempCurrentPos);
      }
    } else {
      // --- OVERVIEW MODE ---
      controlsRef.current.minDistance = 2;
      controlsRef.current.maxDistance = 350;

      controlsRef.current.target.lerp(overviewTarget, lerpSpeed);
      camera.position.lerp(overviewPos, lerpSpeed);

      if (camera.position.distanceTo(overviewPos) < 0.5) {
        isTransitioning.current = false;
      }
    }

    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.06}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}
