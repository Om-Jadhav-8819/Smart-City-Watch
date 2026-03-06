import React from 'react';
import { Zap, Droplets, Car, Hospital, LayoutDashboard, TrendingUp, Share2, Settings, Globe } from 'lucide-react';

export const ZONE_NAMES = [
  "North West", "North Central", "North East",
  "Central West", "City Core", "Central East",
  "South West", "South Central", "South East"
];

export const POPULATIONS = [42000, 58000, 39000, 61000, 94000, 55000, 37000, 48000, 41000];

export const ZONE_TYPES = [
  "Residential", "Residential", "Commercial",
  "Industrial", "City Core", "Industrial",
  "Residential", "Commercial", "Residential"
];

export const ASSET_PROFILES = {
  Residential: { 
    roads: [0.8, 1.2, 0.7, 1.1], 
    power: [0.6, 1.1, 0.8, 1.3], 
    water: [0.7, 1.3, 0.6, 1.2], 
    healthcare: [0.9, 1.0, 1.0, 1.1] 
  },
  Commercial: { 
    roads: [0.5, 1.4, 1.5, 0.8], 
    power: [0.4, 1.3, 1.4, 0.6], 
    water: [0.5, 1.1, 1.2, 0.7], 
    healthcare: [1.0, 1.2, 1.1, 1.0] 
  },
  Industrial: { 
    roads: [0.7, 1.1, 1.1, 0.9], 
    power: [1.2, 1.3, 1.3, 1.2], 
    water: [1.3, 1.4, 1.4, 1.3], 
    healthcare: [0.8, 0.9, 0.9, 0.8] 
  },
  "City Core": { 
    roads: [0.6, 1.5, 1.6, 0.9], 
    power: [0.7, 1.4, 1.5, 0.8], 
    water: [0.8, 1.3, 1.4, 0.9], 
    healthcare: [1.1, 1.3, 1.2, 1.1] 
  }
};

export const ASSET_META = {
  roads: { label: "Roads", icon: <Car size={16} />, color: "#60A5FA" },
  power: { label: "Power Grid", icon: <Zap size={16} />, color: "#F59E0B" },
  water: { label: "Water Supply", icon: <Droplets size={16} />, color: "#3B82F6" },
  healthcare: { label: "Healthcare", icon: <Hospital size={16} />, color: "#EC4899" }
};

export const STATUS_THRESHOLDS = {
  warning: 75,
  critical: 90
};

export const COLORS = {
  bg: "#06060F",
  sidebar: "#09091A",
  card: "#0C0C1E",
  border: "#14142A",
  dimBorder: "#1E1E3A",
  text: "#D4D4E8",
  dimText: "#5A5A7A",
  blue: "#60A5FA",
  purple: "#A78BFA",
  red: "#EF4444",
  amber: "#F59E0B",
  green: "#10B981",
  teal: "#14B8A6"
};

export const CUSTOM_ASSET_DEFAULTS = {
  alertThreshold: 88,
  reversionSpeedMin: 0.06,
  reversionSpeedMax: 0.10,
  noiseLevelMin: 2.0,
  noiseLevelMax: 4.0,
  correlation: 0.12
};

export const EVENT_LOADS = {
  none: { roads: 0, power: 0, water: 0, healthcare: 0 },
  concert: { roads: 22, power: 15, water: 8, healthcare: 5 },
  disaster: { roads: 35, power: 40, water: 30, healthcare: 45 },
  peakhour: { roads: 28, power: 12, water: 5, healthcare: 2 },
  construction: { roads: 18, power: 5, water: 10, healthcare: 0 }
};

export const DEPENDENCIES = {
  power: ["water", "healthcare"],
  water: ["healthcare"],
  roads: ["healthcare"],
  healthcare: []
};

export const EMERGENCY_CONTACTS = {
  police: "911",
  fire: "911",
  medical: "911",
  power: "1-800-PWR-GRID",
  water: "1-800-WTR-MAIN"
};
