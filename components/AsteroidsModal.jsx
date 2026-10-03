"use client";

import React, { useState, useEffect } from "react";
import { useSolarStore } from "../store/useSolarStore";

/**
 * Modal dialog presenting live NASA NeoWs asteroid telemetry,
 * diameter estimations, hazardous asteroid indicators, and Asteroid Belt science.
 */
export function AsteroidsModal() {
  const showAsteroidModal = useSolarStore((state) => state.showAsteroidModal);
  const setShowAsteroidModal = useSolarStore((state) => state.setShowAsteroidModal);
  const focusBody = useSolarStore((state) => state.focusBody);

  const [asteroidData, setAsteroidData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (showAsteroidModal && !asteroidData) {
      setLoading(true);
      fetch("/api/asteroids")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.asteroids) {
            setAsteroidData(data);
          } else {
            setError("Unable to load NASA asteroid catalog");
          }
        })
        .catch(() => setError("Network error connecting to NASA NeoWs"))
        .finally(() => setLoading(false));
    }
  }, [showAsteroidModal, asteroidData]);

  if (!showAsteroidModal) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="NASA Asteroid Belt & NeoWs Telemetry"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-zinc-950/90 border border-zinc-800 p-5 sm:p-7 shadow-2xl text-zinc-100 flex flex-col gap-4 ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b] animate-pulse" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wider">
                Asteroid Belt & NASA Telemetry
              </h2>
              <p className="text-xs text-zinc-400">
                Main Belt (Between Mars & Jupiter) • NASA Near-Earth Object Web Service (NeoWs)
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAsteroidModal(false)}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Close Asteroids Modal"
            aria-label="Close Asteroids Modal"
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

        {/* Quick Facts Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Belt Location</span>
            <span className="text-xs font-semibold text-zinc-200">2.2 to 3.2 AU (Mars-Jupiter)</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Estimated Objects</span>
            <span className="text-xs font-semibold text-zinc-200">1.1–1.9 Million (&gt;1 km)</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Largest Body</span>
            <span className="text-xs font-semibold text-amber-300">Ceres (939 km)</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center">
            <button
              onClick={() => {
                setShowAsteroidModal(false);
                focusBody("ceres");
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <span>Focus Ceres</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Asteroid Telemetry Table */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
              <p className="text-xs text-zinc-400 font-mono">Querying NASA small-body telemetry...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs">
              {error}
            </div>
          )}

          {asteroidData && !loading && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-2">
                <span>Catalog Feed: {asteroidData.source}</span>
                <span>Tracked Objects: {asteroidData.count}</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3">Asteroid Name</th>
                      <th className="py-2.5 px-3">Diameter</th>
                      <th className="py-2.5 px-3">Orbit Radius</th>
                      <th className="py-2.5 px-3">Period</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono">
                    {asteroidData.asteroids.map((ast) => (
                      <tr key={ast.id} className="hover:bg-zinc-850/50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-zinc-200">{ast.name}</td>
                        <td className="py-2.5 px-3 text-zinc-300">
                          {ast.diameterKm >= 10
                            ? `${ast.diameterKm} km`
                            : `${(ast.diameterKm * 1000).toFixed(0)} m`}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-400">{ast.semiMajorAxisAu} AU</td>
                        <td className="py-2.5 px-3 text-zinc-400">{ast.orbitalPeriodDays} d</td>
                        <td className="py-2.5 px-3">
                          {ast.isHazardous ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/40">
                              Hazardous
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Stable
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
