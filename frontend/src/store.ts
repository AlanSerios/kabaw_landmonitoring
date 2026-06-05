import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Waypoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  dateAdded: string;
};

export type Notification = {
  id: string;
  type: 'warning' | 'success' | 'info' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
  baseId?: string;
};

export type MonitoredBase = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  dateAdded: string;
};

export type TabId = 'dashboard' | 'missions' | 'map' | 'analytics' | 'reports';

interface AppState {
  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  
  // Map & Location
  mapCenter: { lat: number; lng: number } | null;
  setMapCenter: (center: { lat: number; lng: number } | null) => void;
  
  selectedLocation: { lat: number; lng: number } | null;
  setSelectedLocation: (location: { lat: number; lng: number } | null) => void;
  
  // We'll migrate away from single mainLocation to monitoredBases, but keep it for backwards compatibility during migration.
  mainLocation: { lat: number; lng: number; name: string } | null;
  setMainLocation: (location: { lat: number; lng: number; name: string } | null) => void;
  
  monitoredBases: MonitoredBase[];
  addMonitoredBase: (base: Omit<MonitoredBase, 'id' | 'dateAdded'>) => void;
  removeMonitoredBase: (id: string) => void;
  
  primaryBaseId: string | null;
  setPrimaryBaseId: (id: string | null) => void;
  
  newlyAddedBaseId: string | null;
  setNewlyAddedBaseId: (id: string | null) => void;
  
  isPlottingMainLocation: boolean;
  setIsPlottingMainLocation: (isPlotting: boolean) => void;
  
  isNamingWaypoint: boolean;
  setIsNamingWaypoint: (isNaming: boolean) => void;
  pendingWaypointCoords: { lat: number, lng: number } | null;
  setPendingWaypointCoords: (coords: { lat: number, lng: number } | null) => void;
  
  activeReportMode: 'scan' | 'weekly';
  setActiveReportMode: (mode: 'scan' | 'weekly') => void;
  
  showMainBaseModal: boolean;
  setShowMainBaseModal: (show: boolean) => void;
  
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

  // Notifications
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, 'id' | 'read' | 'time'>) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Analytics Timeframe
  timeframe: 'days' | 'months' | 'years';
  setTimeframe: (timeframe: 'days' | 'months' | 'years') => void;

  // Language
  language: 'en' | 'tl';
  setLanguage: (lang: 'en' | 'tl') => void;
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
      
      mainLocation: null,
      setMainLocation: (location) => set({ mainLocation: location }),
      
      monitoredBases: [],
      addMonitoredBase: (base) => set((state) => {
        const newBase = {
          ...base,
          id: Math.random().toString(36).substr(2, 9),
          dateAdded: new Date().toISOString()
        };
        const isFirst = state.monitoredBases.length === 0;
        return {
          monitoredBases: [...state.monitoredBases, newBase],
          primaryBaseId: isFirst ? newBase.id : state.primaryBaseId,
          // Sync legacy mainLocation for now
          mainLocation: isFirst ? newBase : state.mainLocation,
          // Mark as newly added so the UI can prompt the user
          newlyAddedBaseId: !isFirst ? newBase.id : null,
          notifications: !isFirst ? [
            {
              id: Math.random().toString(36).substr(2, 9),
              type: 'info',
              title: 'New Base Plotted',
              message: `You've added "${newBase.name}". Click here to set it as your primary base.`,
              time: new Date().toISOString(),
              read: false,
              baseId: newBase.id
            },
            ...state.notifications
          ] : state.notifications
        };
      }),
      removeMonitoredBase: (id) => set((state) => ({
        monitoredBases: state.monitoredBases.filter(b => b.id !== id),
        primaryBaseId: state.primaryBaseId === id ? null : state.primaryBaseId
      })),
      
      primaryBaseId: null,
      setPrimaryBaseId: (id) => set((state) => {
        const base = state.monitoredBases.find(b => b.id === id);
        return { 
          primaryBaseId: id,
          mainLocation: base ? { lat: base.lat, lng: base.lng, name: base.name } : state.mainLocation
        };
      }),
      
      newlyAddedBaseId: null,
      setNewlyAddedBaseId: (id) => set({ newlyAddedBaseId: id }),
      
      isPlottingMainLocation: false,
      setIsPlottingMainLocation: (isPlotting) => set({ isPlottingMainLocation: isPlotting }),
      
      isNamingWaypoint: false,
      setIsNamingWaypoint: (isNaming) => set({ isNamingWaypoint: isNaming }),
      pendingWaypointCoords: null,
      setPendingWaypointCoords: (coords) => set({ pendingWaypointCoords: coords }),
      
      activeReportMode: 'scan',
      setActiveReportMode: (mode) => set({ activeReportMode: mode }),
      
      showMainBaseModal: false,
      setShowMainBaseModal: (show) => set({ showMainBaseModal: show }),
      
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

      // Notifications
      notifications: [],
      addNotification: (notif) => set((state) => ({
        notifications: [
          {
            ...notif,
            id: Math.random().toString(36).substr(2, 9),
            time: new Date().toISOString(),
            read: false
          },
          ...state.notifications
        ]
      })),
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      clearNotifications: () => set({ notifications: [] }),

      // Analytics Timeframe
      timeframe: 'days',
      setTimeframe: (tf) => set({ timeframe: tf }),

      // Language
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'kabaw-storage',
      // only persist waypoints and settings, not transient state like current tab or scan results
      partialize: (state) => ({ 
        waypoints: state.waypoints, 
        scanRadius: state.scanRadius, 
        language: state.language, 
        mainLocation: state.mainLocation,
        monitoredBases: state.monitoredBases,
        primaryBaseId: state.primaryBaseId,
        notifications: state.notifications
      }),
    }
  )
);
