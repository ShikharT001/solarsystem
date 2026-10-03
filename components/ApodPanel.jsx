"use client";

import React, { useState, useEffect } from "react";
import { useSolarStore } from "../store/useSolarStore";

/**
 * Collapsible NASA Astronomy Picture of the Day (APOD) overlay panel.
 * Fetches safely through the internal /api/apod proxy route without exposing API keys.
 */
export function ApodPanel() {
  const showApod = useSolarStore((state) => state.showApod);
  const setShowApod = useSolarStore((state) => state.setShowApod);

  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (showApod && !apodData) {
      setLoading(true);
      fetch("/api/apod")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setApodData(data);
          } else if (data.fallback) {
            setApodData(data.fallback);
          } else {
            setError("Unable to load NASA APOD feed");
          }
        })
        .catch(() => setError("Network error fetching NASA APOD"))
        .finally(() => setLoading(false));
    }
  }, [showApod, apodData]);

  if (!showApod) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="NASA Astronomy Picture of the Day"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-950/90 border border-zinc-800 p-6 shadow-2xl text-zinc-100 flex flex-col gap-4 ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              NASA Astronomy Picture of the Day
            </h2>
          </div>
          <button
            onClick={() => setShowApod(false)}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Close APOD Modal"
            aria-label="Close APOD Modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">Receiving telemetry from NASA APOD...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs">
            {error}
          </div>
        )}

        {apodData && !loading && (
          <div className="flex flex-col gap-4">
            {apodData.media_type === "image" ? (
              <div className="relative w-full max-h-[380px] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                <img
                  src={apodData.url}
                  alt={apodData.title}
                  className="w-full h-full object-cover max-h-[380px]"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800">
                <iframe
                  src={apodData.url}
                  title={apodData.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  {apodData.title}
                </h3>
                <span className="text-xs font-mono text-cyan-400">{apodData.date}</span>
              </div>
              {apodData.copyright && (
                <p className="text-xs text-zinc-400 mb-2">Credit: {apodData.copyright}</p>
              )}
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-h-48 overflow-y-auto pr-2">
                {apodData.explanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
