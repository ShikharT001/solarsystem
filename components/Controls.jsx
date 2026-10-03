"use client";

import React, { useEffect } from "react";
import { BODIES_DATA } from "../data/bodies";
import { useSolarStore } from "../store/useSolarStore";

const BODY_KEYS = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "moon",
  "mars",
  "ceres",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
];

/**
 * Interactive Focus Dock and Simulation Controls:
 * - Focus dock with buttons for every body + Overview
 * - Keyboard listeners: 0-9 for quick focus, Esc for overview, Arrow Left/Right to cycle
 * - Dedicated "+" / "-" zoom buttons and zoom slider for focused body
 * - Live real-time ephemeris toggle with date picker and "Now" button
 * - Speed slider, Pause/Play, Orbit paths toggle, and NASA APOD modal toggle
 */
export function Controls() {
  const selectedId = useSolarStore((state) => state.selectedId);
  const focusBody = useSolarStore((state) => state.focusBody);
  const resetOverview = useSolarStore((state) => state.resetOverview);

  const speed = useSolarStore((state) => state.speed);
  const setSpeed = useSolarStore((state) => state.setSpeed);
  const isPaused = useSolarStore((state) => state.isPaused);
  const togglePaused = useSolarStore((state) => state.togglePaused);

  const showOrbits = useSolarStore((state) => state.showOrbits);
  const toggleShowOrbits = useSolarStore((state) => state.toggleShowOrbits);

  const showAsteroids = useSolarStore((state) => state.showAsteroids);
  const toggleShowAsteroids = useSolarStore((state) => state.toggleShowAsteroids);
  const toggleShowAsteroidModal = useSolarStore((state) => state.toggleShowAsteroidModal);

  const liveMode = useSolarStore((state) => state.liveMode);
  const toggleLiveMode = useSolarStore((state) => state.toggleLiveMode);
  const selectedDate = useSolarStore((state) => state.selectedDate);
  const setSelectedDate = useSolarStore((state) => state.setSelectedDate);
  const resetToNow = useSolarStore((state) => state.resetToNow);

  const zoomLevel = useSolarStore((state) => state.zoomLevel);
  const setZoomLevel = useSolarStore((state) => state.setZoomLevel);
  const zoomIn = useSolarStore((state) => state.zoomIn);
  const zoomOut = useSolarStore((state) => state.zoomOut);

  const toggleShowApod = useSolarStore((state) => state.toggleShowApod);

  // Keyboard navigation: 0-9 to focus bodies, Esc for overview, Arrow Left/Right to cycle
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is interacting with form inputs (e.g. date picker)
      if (e.target.tagName === "INPUT") return;

      if (e.key === "Escape") {
        resetOverview();
      } else if (e.key >= "0" && e.key <= "9") {
        const index = parseInt(e.key, 10);
        if (BODY_KEYS[index]) {
          focusBody(BODY_KEYS[index]);
        }
      } else if (e.key === "ArrowRight") {
        const currIndex = BODY_KEYS.indexOf(selectedId);
        const nextIndex = currIndex === -1 ? 0 : (currIndex + 1) % BODY_KEYS.length;
        focusBody(BODY_KEYS[nextIndex]);
      } else if (e.key === "ArrowLeft") {
        const currIndex = BODY_KEYS.indexOf(selectedId);
        const prevIndex =
          currIndex === -1
            ? BODY_KEYS.length - 1
            : (currIndex - 1 + BODY_KEYS.length) % BODY_KEYS.length;
        focusBody(BODY_KEYS[prevIndex]);
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-") {
        zoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, focusBody, resetOverview, zoomIn, zoomOut]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 pointer-events-none p-2 sm:p-5 flex flex-col items-center gap-2 sm:gap-3">
      {/* 1. Celestial Focus Dock (Bottom bar on desktop, horizontal scroll on mobile) */}
      <div className="pointer-events-auto max-w-full overflow-x-auto no-scrollbar py-1 px-2.5 rounded-full bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 shadow-2xl flex items-center gap-1.5 ring-1 ring-white/10">
        <button
          onClick={resetOverview}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            !selectedId
              ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.6)]"
              : "text-zinc-300 hover:text-white hover:bg-zinc-800/60"
          }`}
          title="Return to full overview (Esc)"
        >
          🌌 Overview
        </button>

        <div className="w-px h-4 bg-zinc-800 mx-0.5" />

        {BODIES_DATA.map((body, idx) => {
          const isSelected = selectedId === body.id;
          return (
            <button
              key={body.id}
              onClick={() => focusBody(body.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-white text-zinc-950 shadow-md scale-105 font-semibold"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-800/60"
              }`}
              title={`Focus ${body.name} (${idx})`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: body.color }}
              />
              {body.name}
            </button>
          );
        })}
      </div>

      {/* 2. Primary Simulation Controls & Toolbars */}
      <div className="pointer-events-auto rounded-2xl bg-zinc-950/85 backdrop-blur-xl border border-zinc-800/80 p-2 sm:px-4 shadow-2xl flex flex-wrap items-center justify-center gap-2.5 sm:gap-5 text-zinc-100 ring-1 ring-white/10">
        {/* Play / Pause */}
        <button
          onClick={togglePaused}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isPaused
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
          }`}
          title={isPaused ? "Resume simulation" : "Pause simulation"}
          aria-label={isPaused ? "Play" : "Pause"}
        >
          {isPaused ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Play</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Pause</span>
            </>
          )}
        </button>

        {/* Speed Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-400 font-medium">Speed</span>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-16 sm:w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            aria-label="Simulation speed multiplier"
          />
          <span className="text-xs font-mono font-semibold text-cyan-300 w-8 text-right">
            {speed.toFixed(1)}x
          </span>
        </div>

        {/* Zoom Controls (when focused on a body) */}
        {selectedId && (
          <div className="flex items-center gap-1 bg-zinc-900/80 px-2 py-1 rounded-xl border border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-medium mr-1">Zoom</span>
            <button
              onClick={zoomIn}
              className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-xs font-bold text-white transition-colors"
              title="Zoom in (+)"
            >
              +
            </button>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-14 sm:w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              aria-label="Body zoom slider"
            />
            <button
              onClick={zoomOut}
              className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-xs font-bold text-white transition-colors"
              title="Zoom out (-)"
            >
              -
            </button>
          </div>
        )}

        {/* Live Ephemeris Mode Toggle & Date Picker */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleLiveMode}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              liveMode
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                : "bg-transparent text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
            title="Toggle live real astronomical planetary positions"
          >
            {liveMode ? "● Live Ephemeris" : "○ Simulated"}
          </button>

          {liveMode && (
            <div className="flex items-center gap-1 bg-zinc-900/90 px-2 py-1 rounded-xl border border-zinc-800">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-[11px] font-mono text-zinc-200 focus:outline-none"
              />
              <button
                onClick={resetToNow}
                className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono text-emerald-400 transition-colors"
                title="Reset to current time"
              >
                Now
              </button>
            </div>
          )}
        </div>

        {/* Orbits Toggle */}
        <button
          onClick={toggleShowOrbits}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            showOrbits
              ? "bg-zinc-800 text-zinc-200 border-zinc-700"
              : "bg-transparent text-zinc-500 border-zinc-800 hover:text-zinc-300"
          }`}
          title="Toggle visibility of orbital lines"
        >
          {showOrbits ? "Orbits ON" : "Orbits OFF"}
        </button>

        {/* Asteroids Belt Toggle */}
        <button
          onClick={toggleShowAsteroids}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            showAsteroids
              ? "bg-zinc-800 text-amber-200 border-amber-600/40"
              : "bg-transparent text-zinc-500 border-zinc-800 hover:text-zinc-300"
          }`}
          title="Toggle visibility of the Main Asteroid Belt"
        >
          {showAsteroids ? "Belt ON" : "Belt OFF"}
        </button>

        {/* Asteroids NASA Telemetry Modal Button */}
        <button
          onClick={toggleShowAsteroidModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-amber-950/40 text-amber-300 border border-amber-600/40 hover:bg-amber-900/40 transition-colors"
          title="View live NASA Asteroid Belt telemetry & Near-Earth Objects"
        >
          <span>☄️</span>
          <span className="hidden sm:inline">Asteroids (NASA)</span>
        </button>

        {/* NASA APOD Feed Button */}
        <button
          onClick={toggleShowApod}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-indigo-950/40 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900/40 transition-colors"
          title="Explore NASA Astronomy Picture of the Day"
        >
          <span>🔭</span>
          <span className="hidden sm:inline">NASA APOD</span>
        </button>
      </div>
    </div>
  );
}
