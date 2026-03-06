import { useMemo } from 'react';
import { STATUS_THRESHOLDS, ZONE_NAMES } from '../data/cityConstants';

const ASSETS = ["roads", "power", "water", "healthcare"];

export default function useCityData(zones: any[], customAssets: any[] = [], customUtilizations: Record<string, number> = {}) {
  const avgUtil = (assets: any) => {
    const vals = Object.values(assets) as number[];
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const cityHealthScore = useMemo(() => {
    const totalPop = zones.reduce((acc, z) => acc + z.population, 0);
    let weightedScore = 0;
    
    // Zone-level infrastructure (weight 1.0)
    zones.forEach(z => {
      const util = avgUtil(z.assets);
      let score = 100;
      if (util > 60) score -= (util - 60) * 1.5;
      if (util > 80) score -= (util - 80) * 2.5;
      if (util > 95) score -= (util - 95) * 5;
      
      weightedScore += Math.max(0, score) * (z.population / totalPop);
    });

    // Custom assets (weight 0.3)
    if (customAssets.length > 0) {
      let customScore = 0;
      customAssets.forEach(asset => {
        const util = customUtilizations[asset.id] || 50;
        let score = 100;
        if (util > 60) score -= (util - 60) * 1.5;
        if (util > 80) score -= (util - 80) * 2.5;
        if (util > 95) score -= (util - 95) * 5;
        customScore += Math.max(0, score);
      });
      
      const avgCustomScore = customScore / customAssets.length;
      // Blend custom score into weighted score (0.3 weight for custom assets overall)
      weightedScore = (weightedScore * 1.0 + avgCustomScore * 0.3) / 1.3;
    }

    return weightedScore;
  }, [zones, customAssets, customUtilizations]);

  const criticalAssets = useMemo(() => {
    const list: any[] = [];
    // Built-in assets
    zones.forEach(z => {
      ASSETS.forEach(a => {
        if (z.assets[a] >= STATUS_THRESHOLDS.critical) {
          list.push({ zone: z.name, type: a, utilization: z.assets[a], population: z.population, isCustom: false });
        }
      });
    });
    // Custom assets
    customAssets.forEach(asset => {
      const util = customUtilizations[asset.id] || 0;
      if (util >= asset.alertThreshold) {
        list.push({ 
          zone: asset.zoneName, 
          type: asset.assetType, 
          utilization: util, 
          population: zones[asset.zoneId].population * 0.3, 
          isCustom: true,
          name: asset.name,
          id: asset.id
        });
      }
    });
    return list;
  }, [zones, customAssets, customUtilizations]);

  const warningAssets = useMemo(() => {
    const list: any[] = [];
    zones.forEach(z => {
      ASSETS.forEach(a => {
        if (z.assets[a] >= STATUS_THRESHOLDS.warning && z.assets[a] < STATUS_THRESHOLDS.critical) {
          list.push({ zone: z.name, type: a, utilization: z.assets[a], population: z.population, isCustom: false });
        }
      });
    });
    customAssets.forEach(asset => {
      const util = customUtilizations[asset.id] || 0;
      if (util >= asset.alertThreshold - 12 && util < asset.alertThreshold) {
        list.push({ 
          zone: asset.zoneName, 
          type: asset.assetType, 
          utilization: util, 
          population: zones[asset.zoneId].population * 0.3, 
          isCustom: true,
          name: asset.name,
          id: asset.id
        });
      }
    });
    return list;
  }, [zones, customAssets, customUtilizations]);

  const populationAtRisk = useMemo(() => {
    const zoneRisk = zones.reduce((acc, z) => {
      const avg = avgUtil(z.assets);
      return acc + (avg >= STATUS_THRESHOLDS.warning ? z.population : 0);
    }, 0);

    const customRisk = customAssets.reduce((acc, asset) => {
      const util = customUtilizations[asset.id] || 0;
      if (util >= asset.alertThreshold) {
        return acc + (zones[asset.zoneId].population * 0.3);
      }
      return acc;
    }, 0);

    return zoneRisk + customRisk;
  }, [zones, customAssets, customUtilizations]);

  const customAssetAlerts = useMemo(() => {
    return customAssets
      .filter(asset => (customUtilizations[asset.id] || 0) >= asset.alertThreshold)
      .map(asset => ({
        asset,
        utilization: customUtilizations[asset.id],
        delta: customUtilizations[asset.id] - asset.alertThreshold,
        zoneName: asset.zoneName
      }))
      .sort((a, b) => b.delta - a.delta);
  }, [customAssets, customUtilizations]);

  const avgUtilByZone = useMemo(() => {
    const map: any = {};
    zones.forEach(z => {
      map[z.id] = avgUtil(z.assets);
    });
    return map;
  }, [zones]);

  return {
    cityHealthScore,
    criticalAssets,
    warningAssets,
    populationAtRisk,
    avgUtilByZone,
    customAssetAlerts
  };
}
