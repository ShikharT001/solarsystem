"use client";

import dynamic from "next/dynamic";
import { InfoPanel } from "../components/InfoPanel";
import { Controls } from "../components/Controls";
import { ApodPanel } from "../components/ApodPanel";
import { AsteroidsModal } from "../components/AsteroidsModal";

// Dynamically import the 3D Canvas component to prevent SSR hydration mismatches
const SolarSystem = dynamic(() => import("../components/SolarSystem"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-[#030308] text-zinc-400">
      <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
      <span className="text-xs font-mono tracking-widest text-cyan-300 uppercase animate-pulse">
        Initializing 3D Universe & Telemetry...
      </span>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#030308]">
      {/* Top Header HUD overlay */}
      <header className="fixed top-0 left-0 z-20 pointer-events-none p-4 sm:p-6 flex flex-col gap-1">
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
          <h1 className="text-lg sm:text-xl font-bold tracking-wider uppercase text-white font-mono">
            Solar System <span className="text-cyan-400 text-xs sm:text-sm font-normal">3D Pro</span>
          </h1>
        </div>
        <p className="hidden sm:block text-[11px] text-zinc-400 font-mono tracking-wide">
          Click or press 0-9 to focus • Esc for overview • + / - to zoom
        </p>
      </header>

      {/* Primary 3D WebGL Scene */}
      <SolarSystem />

      {/* Slide-in Information Panel */}
      <InfoPanel />

      {/* Orbit Controls & Celestial Focus Dock */}
      <Controls />

      {/* NASA APOD Modal Dialog */}
      <ApodPanel />

      {/* NASA Asteroid Belt Telemetry Modal */}
      <AsteroidsModal />
    </main>
  );
}
