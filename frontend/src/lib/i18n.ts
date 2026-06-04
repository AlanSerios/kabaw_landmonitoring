export const translations = {
  en: {
    // Navigation
    dashboard: 'KABAW',
    analytics: 'History',
    reports: 'Reports',
    settings: 'Settings',

    // Dashboard Tab
    status: 'STATUS',
    analyzing: 'Analyzing...',
    standby: 'Standby',
    optimal: 'Optimal',
    warning: 'Warning',
    primarySensor: 'Primary Sensor',
    online: 'Online',
    cropHealth: 'Crop Health',
    moistureLevel: 'Moisture Level',
    recentWaypoints: 'Recent Waypoints',
    viewOnMap: 'View on Map',
    noWaypoints: 'No waypoints. Add one on the map!',

    // Analytics Tab
    simpleHistory: 'Simple History',
    advancedAnalytics: 'Advanced Analytics',
    legend: 'Legend:',
    healthy: 'Healthy',
    watered: 'Well-watered',
    danger: 'Danger',
    drought: 'Extreme Drought',
    both: 'Both',
    overTime: 'over time',
    days: 'Days',
    months: 'Months',
    years: 'Years',

    // Settings
    language: 'Language',
    advancedMode: 'Advanced Mode',
    save: 'Save',

    // Mascot fallback messages (if AI brain is not ready)
    welcomeMascot: "Hey boss! Kuya Kabaw reporting for duty. Tap the map so we can check on your crops!",
  },
  tl: {
    // Navigation
    dashboard: 'KABAW',
    analytics: 'Kasaysayan',
    reports: 'Ulat',
    settings: 'Mga Setting',

    // Dashboard Tab
    status: 'STATUS',
    analyzing: 'Naghahanap...',
    standby: 'Nakahanda',
    optimal: 'Nakita na',
    warning: 'Babala',
    primarySensor: 'Pangunahing Sensor',
    online: 'Online',
    cropHealth: 'Kalusugan ng Tanim',
    moistureLevel: 'Dami ng Tubig',
    recentWaypoints: 'Mga Huling Binantayan',
    viewOnMap: 'Tignan sa Mapa',
    noWaypoints: 'Walang namomonitor. Magdagdag sa mapa!',

    // Analytics Tab
    simpleHistory: 'Simpleng Kasaysayan',
    advancedAnalytics: 'Malalimang Pagsusuri',
    legend: 'Legend:',
    healthy: 'Malusog',
    watered: 'Sapat sa Tubig',
    danger: 'Babala',
    drought: 'Matinding Tagtuyot',
    both: 'Pareho',
    overTime: 'sa paglipas ng panahon',
    days: 'Araw',
    months: 'Buwan',
    years: 'Taon',

    // Settings
    language: 'Wika',
    advancedMode: 'Advanced Mode',
    save: 'I-save',

    // Mascot fallback messages (if AI brain is not ready)
    welcomeMascot: "Hello boss! Kuya Kabaw reporting for duty. Ano, silipin na ba natin 'yung mga pananim mo? Pindot ka lang diyan sa mapa.",
  }
};

export type LanguageCode = 'en' | 'tl';

export const t = (key: keyof typeof translations['en'], lang: LanguageCode) => {
  return translations[lang][key] || translations['en'][key];
};
