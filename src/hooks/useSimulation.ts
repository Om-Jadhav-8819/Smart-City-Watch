import { useState, useEffect, useCallback } from 'react';
import { 
  ZONE_NAMES, 
  POPULATIONS, 
  ZONE_TYPES, 
  ASSET_PROFILES,
  CUSTOM_ASSET_DEFAULTS
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

export default function useSimulation() {
  const [zones, setZones] = useState(mkZones());
  const [simTime, setSimTime] = useState(8);
  const [simHour, setSimHour] = useState(8);
  const [history, setHistory] = useState<any>({});
  const [tick, setTick] = useState(0);

  // --- CUSTOM ASSETS STATE ---
  const [customAssets, setCustomAssets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('cityvitals_custom_assets');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [customUtilizations, setCustomUtilizations] = useState<Record<string, number>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cityvitals_custom_assets') || '[]');
      return Object.fromEntries(saved.map((a: any) => [a.id, a.baselineUtil]));
    } catch { return {}; }
  });

  const [customHistory, setCustomHistory] = useState<Record<string, number[]>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cityvitals_custom_assets') || '[]');
      return Object.fromEntries(saved.map((a: any) => [a.id, [a.baselineUtil]]));
    } catch { return {}; }
  });

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSimTime(prev => {
        const next = (prev + 0.2) % 24;
        setSimHour(Math.floor(next));
        return next;
      });

      let updatedZones: any[] = [];
      setZones(prev => {
        updatedZones = prev.map((z) => {
          const newDrift = { ...z.drift };
          const newAssets = { ...z.assets };
          
          ASSETS.forEach(a => {
            const driftDelta = (Math.random() - 0.5) * 0.8;
            (newDrift as any)[a] = clamp((newDrift as any)[a] + driftDelta, -15, 15);
            const diurnal = getDiurnalFactor(simTime, a, z.type);
            const noise = (Math.random() - 0.5) * 2;
            (newAssets as any)[a] = clamp((z.baseAssets as any)[a] * diurnal + (newDrift as any)[a] + noise);
          });
          
          return { ...z, drift: newDrift, assets: newAssets };
        });
        return updatedZones;
      });

      // Update Custom Assets
      setCustomUtilizations(prev => {
        const updated = { ...prev };
        customAssets.forEach(asset => {
          const zone = updatedZones[asset.zoneId];
          const parentUtil = zone?.assets[asset.assetType] || 50;
          
          const parentInfluence = (parentUtil - (prev[asset.id] || 50)) * CUSTOM_ASSET_DEFAULTS.correlation;
          const ownReversion = (asset.baselineUtil - (prev[asset.id] || 50)) * asset.reversionSpeed;
          const noise = (Math.random() - 0.5) * asset.noiseLevel;
          
          updated[asset.id] = clamp(
            (prev[asset.id] || 50) + parentInfluence + ownReversion + noise
          );
        });
        return updated;
      });

      setTick(t => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [simTime, customAssets]);

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

    // Update Custom History
    setCustomHistory(prev => {
      const updated = { ...prev };
      customAssets.forEach(asset => {
        const current = customUtilizations[asset.id] || asset.baselineUtil;
        const arr = prev[asset.id] || [];
        updated[asset.id] = [...arr.slice(-29), current];
      });
      return updated;
    });
  }, [tick, zones, customAssets, customUtilizations]);

  const addAuditLog = (userName: string, message: string) => {
    try {
      const logs = JSON.parse(localStorage.getItem('cityvitals_audit') || '[]');
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userName,
        message
      };
      const updatedLogs = [newLog, ...logs].slice(0, 50);
      localStorage.setItem('cityvitals_audit', JSON.stringify(updatedLogs));
    } catch (e) {
      console.error("Failed to save audit log", e);
    }
  };

  const addCustomAsset = useCallback((assetData: any, userName: string) => {
    const id = 'custom_' + Date.now();
    const zone = zones[assetData.zoneId];
    const zoneBaseline = (zone.baseAssets as any)[assetData.assetType] || 50;
    const offset = (Math.random() - 0.5) * 16;
    const baselineUtil = clamp(zoneBaseline + offset, 20, 85);
    
    const newAsset = {
      ...assetData,
      id,
      baselineUtil,
      reversionSpeed: CUSTOM_ASSET_DEFAULTS.reversionSpeedMin + Math.random() * (CUSTOM_ASSET_DEFAULTS.reversionSpeedMax - CUSTOM_ASSET_DEFAULTS.reversionSpeedMin),
      noiseLevel: CUSTOM_ASSET_DEFAULTS.noiseLevelMin + Math.random() * (CUSTOM_ASSET_DEFAULTS.noiseLevelMax - CUSTOM_ASSET_DEFAULTS.noiseLevelMin),
      alertThreshold: assetData.alertThreshold || CUSTOM_ASSET_DEFAULTS.alertThreshold,
      createdAt: new Date().toISOString(),
      isCustom: true
    };

    const updatedAssets = [...customAssets, newAsset];
    setCustomAssets(updatedAssets);
    setCustomUtilizations(prev => ({ ...prev, [id]: baselineUtil }));
    setCustomHistory(prev => ({ ...prev, [id]: [baselineUtil] }));
    
    localStorage.setItem('cityvitals_custom_assets', JSON.stringify(updatedAssets));
    addAuditLog(userName, `added custom monitor: "${newAsset.name}" in ${newAsset.zoneName} (${newAsset.assetType})`);
  }, [customAssets, zones]);

  const updateCustomAsset = useCallback((assetId: string, updates: any, userName: string) => {
    const asset = customAssets.find(a => a.id === assetId);
    if (!asset) return;

    const updatedAssets = customAssets.map(a => a.id === assetId ? { ...a, ...updates } : a);
    setCustomAssets(updatedAssets);
    localStorage.setItem('cityvitals_custom_assets', JSON.stringify(updatedAssets));
    addAuditLog(userName, `updated custom monitor: "${asset.name}"`);
  }, [customAssets]);

  const deleteCustomAsset = useCallback((assetId: string, userName: string) => {
    const asset = customAssets.find(a => a.id === assetId);
    if (!asset) return;

    const updatedAssets = customAssets.filter(a => a.id !== assetId);
    setCustomAssets(updatedAssets);
    setCustomUtilizations(prev => {
      const next = { ...prev };
      delete next[assetId];
      return next;
    });
    setCustomHistory(prev => {
      const next = { ...prev };
      delete next[assetId];
      return next;
    });
    
    localStorage.setItem('cityvitals_custom_assets', JSON.stringify(updatedAssets));
    addAuditLog(userName, `deleted monitor: ${asset.name}`);
  }, [customAssets]);

  const resetSimulation = useCallback(() => {
    setZones(mkZones());
  }, []);

  const updateZone = useCallback((zoneId: number, updates: any, userName: string) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, ...updates } : z));
    const zone = zones.find(z => z.id === zoneId);
    addAuditLog(userName, `updated zone settings: ${zone?.name}`);
  }, [zones]);

  return {
    zones,
    simHour,
    history,
    customAssets,
    customUtilizations,
    customHistory,
    resetSimulation,
    updateZone,
    addCustomAsset,
    updateCustomAsset,
    deleteCustomAsset
  };
}
