"use client";

import React, { useState, useEffect } from "react";
import { BODIES_MAP } from "../data/bodies";
import { MODEL_REGISTRY } from "../data/models";
import { useSolarStore } from "../store/useSolarStore";

/**
 * Slide-in HTML info panel displaying planet specifications and interesting facts.
 * Combines cached /api/planets live facts with local fallback data,
 * lists interactive natural satellites (moons) with direct focus click-through,
 * and credits 3D asset sources.
 */
export function InfoPanel() {
  const selectedId = useSolarStore((state) => state.selectedId);
  const focusBody = useSolarStore((state) => state.focusBody);
  const resetOverview = useSolarStore((state) => state.resetOverview);

  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    fetch("/api/planets")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.bodies) {
          setApiData(json.bodies);
        }
      })
      .catch((err) => {
        console.warn("Could not load /api/planets, relying on local specs:", err);
      });
  }, []);

  const body = selectedId ? BODIES_MAP[selectedId] : null;
  const liveStats = apiData && selectedId ? apiData[selectedId] : null;
  const modelCredit = selectedId ? MODEL_REGISTRY[selectedId]?.credit : null;

  const isOpen = Boolean(body);
  const info = body?.info;

  return (
    <aside
      aria-label="Celestial body information"
      className={`fixed z-30 top-0 right-0 h-full w-full sm:w-[380px] md:w-[420px] max-w-full p-4 sm:p-6 transition-transform duration-500 ease-out flex flex-col justify-end sm:justify-start pointer-events-none ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {body && info && (
        <div className="pointer-events-auto w-full max-h-[85vh] sm:max-h-none overflow-y-auto rounded-3xl bg-zinc-950/85 backdrop-blur-xl border border-zinc-800/80 p-6 shadow-2xl text-zinc-100 flex flex-col gap-5 ring-1 ring-white/10 animate-in fade-in slide-in-from-right-8 duration-300">
          {/* Header with Title and Close Button */}
          <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full ring-4 ring-white/10 shadow-[0_0_12px_currentColor]"
                style={{
                  backgroundColor: body.color,
                  color: body.color,
                }}
              />
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {body.name}
                </h2>
                <p className="text-xs font-medium text-zinc-400">
                  {body.type}
                </p>
              </div>
            </div>

            <button
              onClick={resetOverview}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              title="Close and return to overview"
              aria-label="Close details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Planetary Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/50 p-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">
                Diameter
              </span>
              <span className="text-sm font-semibold text-zinc-100">
                {info.diameter}
              </span>
            </div>

            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/50 p-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">
                {body.id === "moon" ? "Distance to Earth" : "Distance to Sun"}
              </span>
              <span className="text-sm font-semibold text-zinc-100">
                {body.id === "moon" ? info.distanceFromEarth : info.distanceFromSun}
              </span>
            </div>

            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/50 p-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">
                Orbital Period
              </span>
              <span className="text-sm font-semibold text-zinc-100">
                {liveStats?.sideralOrbit
                  ? typeof liveStats.sideralOrbit === "number"
                    ? `${liveStats.sideralOrbit.toFixed(1)} days`
                    : liveStats.sideralOrbit
                  : info.orbitalPeriod}
              </span>
            </div>

            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/50 p-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">
                Moons / Satellites
              </span>
              <span className="text-sm font-semibold text-zinc-100">
                {liveStats?.moonsCount ?? info.moons}
              </span>
            </div>

            {info.surfaceTemp && (
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/50 p-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">
                  Surface Temp
                </span>
                <span className="text-sm font-semibold text-zinc-100">
                  {info.surfaceTemp}
                </span>
              </div>
            )}

            {info.rotationPeriod && (
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/50 p-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">
                  Rotation Period
                </span>
                <span className="text-sm font-semibold text-zinc-100">
                  {info.rotationPeriod}
                </span>
              </div>
            )}
          </div>

          {/* Moons & Orbiting Subsystems Click-Through */}
          {body.moons && body.moons.length > 0 && (
            <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/60 p-3.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Orbiting Satellites ({body.moons.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {body.moons.map((moonId) => {
                  const m = BODIES_MAP[moonId];
                  if (!m) return null;
                  return (
                    <button
                      key={moonId}
                      onClick={() => focusBody(moonId)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-cyan-600/30 hover:border-cyan-400 border border-zinc-700 text-xs font-medium text-white transition-all group"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                      <span>{m.name}</span>
                      <span className="text-[10px] text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* If Moon is focused, allow jumping back to Earth */}
          {body.parent && body.parent !== "sun" && (
            <button
              onClick={() => focusBody(body.parent)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-900/80 border border-zinc-700/80 text-xs font-medium text-cyan-300 hover:bg-zinc-800 transition-colors"
            >
              <span>Orbiting {BODIES_MAP[body.parent]?.name}</span>
              <span>• Jump to {BODIES_MAP[body.parent]?.name} →</span>
            </button>
          )}

          {/* Fun Fact Callout */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 to-cyan-950/40 border border-cyan-800/30 p-4">
            <div className="flex items-center gap-2 mb-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <span>✨</span>
              <span>Did you know?</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {info.funFact}
            </p>
          </div>

          {/* 3D Model Attribution Credit */}
          {modelCredit && (
            <p className="text-[10px] text-zinc-500 font-mono tracking-tight leading-normal">
              3D Asset: {modelCredit}
            </p>
          )}

          {/* Back to Overview Action */}
          <button
            onClick={resetOverview}
            className="w-full mt-1 py-2.5 px-4 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-zinc-700/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Solar Overview
          </button>
        </div>
      )}
    </aside>
  );
}
