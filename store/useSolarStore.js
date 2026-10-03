import { create } from "zustand";
import { BODIES_MAP, getBody } from "../data/bodies";

// Shared non-reactive ref registry to allow 60fps camera tracking
// without triggering React re-renders on every animation frame
export const planetRefs = new Map();

export const registerPlanetRef = (id, ref) => {
  planetRefs.set(id, ref);
};

export const unregisterPlanetRef = (id) => {
  planetRefs.delete(id);
};

export const getPlanetRef = (id) => {
  return planetRefs.get(id);
};

export const useSolarStore = create((set, get) => ({
  // Selected celestial body id ('sun', 'earth', 'moon', etc., or null for overview)
  selectedId: null,
  focusMode: "overview", // 'overview' | 'focused'

  // Focus a specific celestial body
  focusBody: (id) => {
    if (!id || !BODIES_MAP[id]) {
      set({ selectedId: null, focusMode: "overview", zoomLevel: 1.0 });
    } else {
      set({ selectedId: id, focusMode: "focused", zoomLevel: 1.0 });
    }
  },

  // Reset to full solar system overview
  resetOverview: () => {
    set({ selectedId: null, focusMode: "overview", zoomLevel: 1.0 });
  },

  // Simulation speed multiplier (0.1x to 5.0x)
  speed: 1.0,
  setSpeed: (speed) => set({ speed: Math.max(0.1, Math.min(5.0, speed)) }),

  // Pause / Resume orbital simulation
  isPaused: false,
  togglePaused: () => set((state) => ({ isPaused: !state.isPaused })),
  setIsPaused: (isPaused) => set({ isPaused }),

  // Live real-time planetary positions toggle
  liveMode: false,
  toggleLiveMode: () => set((state) => ({ liveMode: !state.liveMode })),
  setLiveMode: (liveMode) => set({ liveMode }),

  // Live ephemeris date (defaults to current date)
  selectedDate: new Date().toISOString().slice(0, 10),
  setSelectedDate: (dateStr) => set({ selectedDate: dateStr }),
  resetToNow: () => set({ selectedDate: new Date().toISOString().slice(0, 10) }),

  // Zoom control level for the focused body (multiplier between 0.5 and 3.0)
  zoomLevel: 1.0,
  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.5, Math.min(3.0, zoom)) }),
  zoomIn: () => set((state) => ({ zoomLevel: Math.max(0.5, state.zoomLevel - 0.25) })),
  zoomOut: () => set((state) => ({ zoomLevel: Math.min(3.0, state.zoomLevel + 0.25) })),

  // Orbit path lines visibility toggle
  showOrbits: true,
  toggleShowOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),

  // Asteroid belt visibility toggle
  showAsteroids: true,
  toggleShowAsteroids: () => set((state) => ({ showAsteroids: !state.showAsteroids })),

  // Asteroids telemetry modal toggle
  showAsteroidModal: false,
  setShowAsteroidModal: (showAsteroidModal) => set({ showAsteroidModal }),
  toggleShowAsteroidModal: () => set((state) => ({ showAsteroidModal: !state.showAsteroidModal })),

  // NASA APOD collapsible modal toggle
  showApod: false,
  toggleShowApod: () => set((state) => ({ showApod: !state.showApod })),
  setShowApod: (showApod) => set({ showApod }),

  // Hovered body id for pointer tooltips
  hoveredId: null,
  setHoveredId: (id) => set({ hoveredId: id }),

  // Helper selector for currently focused body data
  getFocusedBody: () => {
    const { selectedId } = get();
    return getBody(selectedId);
  },
}));
