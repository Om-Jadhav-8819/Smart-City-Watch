import { useMemo } from 'react';
import { STATUS_THRESHOLDS } from '../data/cityConstants';

const ASSETS = ["roads", "power", "water", "healthcare"];

export default function useCityData(zones: any[]) {
  const avgUtil = (assets: any) => {
    const vals = Object.values(assets) as number[];
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const cityHealthScore = useMemo(() => {
    const totalPop = zones.reduce((acc, z) => acc + z.population, 0);
    let weightedScore = 0;
    zones.forEach(z => {
      const util = avgUtil(z.assets);
      let score = 100;
      if (util > 60) score -= (util - 60) * 1.5;
      if (util > 80) score -= (util - 80) * 2.5;
      if (util > 95) score -= (util - 95) * 5;
      
      weightedScore += Math.max(0, score) * (z.population / totalPop);
    });
    return weightedScore;
  }, [zones]);

  const criticalAssets = useMemo(() => {
    const list: any[] = [];
    zones.forEach(z => {
      ASSETS.forEach(a => {
        if (z.assets[a] >= STATUS_THRESHOLDS.critical) {
          list.push({ zone: z.name, type: a, utilization: z.assets[a], population: z.population });
        }
      });
    });
    return list;
  }, [zones]);

  const warningAssets = useMemo(() => {
    const list: any[] = [];
    zones.forEach(z => {
      ASSETS.forEach(a => {
        if (z.assets[a] >= STATUS_THRESHOLDS.warning && z.assets[a] < STATUS_THRESHOLDS.critical) {
          list.push({ zone: z.name, type: a, utilization: z.assets[a], population: z.population });
        }
      });
    });
    return list;
  }, [zones]);

  const populationAtRisk = useMemo(() => {
    return zones.reduce((acc, z) => {
      const avg = avgUtil(z.assets);
      return acc + (avg >= STATUS_THRESHOLDS.warning ? z.population : 0);
    }, 0);
  }, [zones]);

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
    avgUtilByZone
  };
}
