import { useState, useEffect, useCallback } from 'react';
import { 
  ZONE_NAMES, 
  POPULATIONS, 
  ZONE_TYPES, 
  ASSET_PROFILES 
} from '../data/cityConstants';

const ASSETS = ["roads", "power", "water", "healthcare"] as const;
type AssetKey = typeof ASSETS[number];

const clamp = (val: number, min = 0, max = 100) => Math.max(min, Math.min(max, val));

const getDiurnalFactor = (hour: number, asset: AssetKey, type: string) => {
  const profile = (ASSET_PROFILES as any)[type][asset];
  const segment = Math.floor(hour / 6) % 4;
  const nextSegment = (segment + 1) % 4;
  const t = (hour % 6) / 6;
  
  const startVal = profile[segment];
  const endVal = profile[nextSegment];
  
  return startVal + (endVal - startVal) * t;
};

const mkZones = () => ZONE_NAMES.map((name, i) => {
  const type = ZONE_TYPES[i];
  const baseAssets = {
    roads: 40 + Math.random() * 10 + (i === 4 ? 15 : 0),
    power: 45 + Math.random() * 10 + (i === 4 ? 15 : 0),
    water: 42 + Math.random() * 10 + (i === 4 ? 10 : 0),
    healthcare: 40 + Math.random() * 10 + (i === 4 ? 12 : 0)
  };
  return {
    id: i,
    name,
    type,
    population: POPULATIONS[i],
    baseAssets,
    assets: { ...baseAssets },
    drift: { roads: 0, power: 0, water: 0, healthcare: 0 },
    threshold: 90,
    notes: "",
    priority: "Medium"
  };
});

const adjZones = (id: number) => {
  const r = Math.floor(id / 3);
  const c = id % 3;
  const adj = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
        adj.push(nr * 3 + nc);
      }
    }
  }
  return adj;
};

export default function useSimulation() {
  const [zones, setZones] = useState(mkZones());
  const [simTime, setSimTime] = useState(8);
  const [simHour, setSimHour] = useState(8);
  const [history, setHistory] = useState<any>({});
  const [tick, setTick] = useState(0);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSimTime(prev => {
        const next = (prev + 0.2) % 24;
        setSimHour(Math.floor(next));
        return next;
      });

      setZones(prev => prev.map((z) => {
        const newDrift = { ...z.drift };
        const newAssets = { ...z.assets };
        
        ASSETS.forEach(a => {
          // 1. Update Drift (Random walk)
          const driftDelta = (Math.random() - 0.5) * 0.8;
          (newDrift as any)[a] = clamp((newDrift as any)[a] + driftDelta, -15, 15);
          
          // 2. Calculate Diurnal Factor
          const diurnal = getDiurnalFactor(simTime, a, z.type);
          
          // 3. Combine: Base * Diurnal + Drift + Noise
          const noise = (Math.random() - 0.5) * 2;
          (newAssets as any)[a] = clamp((z.baseAssets as any)[a] * diurnal + (newDrift as any)[a] + noise);
        });
        
        return { ...z, drift: newDrift, assets: newAssets };
      }));
      setTick(t => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [simTime]);

  // History Recording
  useEffect(() => {
    setHistory((prev: any) => {
      const next = { ...prev };
      zones.forEach(z => {
        if (!next[z.id]) next[z.id] = { roads: [], power: [], water: [], healthcare: [] };
        ASSETS.forEach(a => {
          const h = [...(next[z.id][a] || []), (z.assets as any)[a]];
          next[z.id][a] = h.slice(-30);
        });
      });
      return next;
    });
  }, [tick, zones]);

  const resetSimulation = useCallback(() => {
    setZones(mkZones());
  }, []);

  const updateZone = useCallback((zoneId: number, updates: any) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, ...updates } : z));
  }, []);

  return {
    zones,
    simHour,
    history,
    resetSimulation,
    updateZone
  };
}
