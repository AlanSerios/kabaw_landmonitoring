import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Waypoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  dateAdded: string;
};

export type TabId = 'dashboard' | 'missions' | 'map' | 'analytics' | 'reports' | 'settings';

interface AppState {
  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  
  // Map & Location
  mapCenter: { lat: number; lng: number } | null;
  setMapCenter: (center: { lat: number; lng: number } | null) => void;
  
  selectedLocation: { lat: number; lng: number } | null;
  setSelectedLocation: (location: { lat: number; lng: number } | null) => void;
  
  scanRadius: number;
  setScanRadius: (radius: number) => void;
  
  // Data
  waypoints: Waypoint[];
  addWaypoint: (waypoint: Omit<Waypoint, 'id' | 'dateAdded'>) => void;
  removeWaypoint: (id: string) => void;
  
  // Current Scan Result
  scanResult: any | null;
  setScanResult: (result: any | null) => void;
  
  // Location name from search
  locationName: string;
  setLocationName: (name: string) => void;

  // Analytics Timeframe
  timeframe: 'days' | 'months' | 'years';
  setTimeframe: (timeframe: 'days' | 'months' | 'years') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Map & Location
      mapCenter: null,
      setMapCenter: (center) => set({ mapCenter: center }),
      
      selectedLocation: null,
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      
      scanRadius: 25,
      setScanRadius: (radius) => set({ scanRadius: radius }),

      // Data
      waypoints: [],
      addWaypoint: (wp) => set((state) => ({
        waypoints: [
          ...state.waypoints, 
          { 
            ...wp, 
            id: Math.random().toString(36).substr(2, 9),
            dateAdded: new Date().toISOString()
          }
        ]
      })),
      removeWaypoint: (id) => set((state) => ({
        waypoints: state.waypoints.filter((wp) => wp.id !== id)
      })),

      // Current Scan Result
      scanResult: null,
      setScanResult: (result) => set({ scanResult: result }),
      
      // Location name
      locationName: '',
      setLocationName: (name) => set({ locationName: name }),

      // Analytics Timeframe
      timeframe: 'days',
      setTimeframe: (tf) => set({ timeframe: tf }),
    }),
    {
      name: 'kabaw-storage',
      // only persist waypoints and settings, not transient state like current tab or scan results
      partialize: (state) => ({ waypoints: state.waypoints, scanRadius: state.scanRadius }),
    }
  )
);
