import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import { Activity, TrendingUp, AlertCircle, Calendar, Shield, Settings, Globe } from 'lucide-react';
import { COLORS, ASSET_META, STATUS_THRESHOLDS } from '../../data/cityConstants';
import SectionTitle from '../shared/SectionTitle';

interface PredictionsProps {
  zones: any[];
  history: any;
  customAssets: any[];
  customUtilizations: Record<string, number>;
  customHistory: Record<string, number[]>;
}

export default function Predictions({ 
  zones, history, customAssets, customUtilizations, customHistory 
}: PredictionsProps) {
  const [selectedZoneId, setSelectedZoneId] = useState(0);

  const selectedZone = zones.find(z => z.id === selectedZoneId);
  const zoneCustoms = customAssets.filter(a => a.zoneId === selectedZoneId);

  const getForecast = (data: number[], threshold: number = 90) => {
    if (!data || data.length < 5) return { status: 'Stable', time: 'N/A' };
    const last5 = data.slice(-5);
    const slope = (last5[4] - last5[0]) / 4;
    
    if (slope <= 0) return { status: 'Stable', time: 'No breach expected' };
    
    const current = last5[4];
    const remaining = threshold - current;
    const ticksToBreach = Math.ceil(remaining / slope);
    
    if (ticksToBreach <= 0) return { status: 'Critical', time: 'Breach Active' };
    if (ticksToBreach < 10) return { status: 'High Risk', time: `~${ticksToBreach * 2}s` };
    return { status: 'Low Risk', time: `> ${ticksToBreach * 2}s` };
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      {/* ZONE SELECTOR */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px", overflowX: "auto", paddingBottom: "8px" }}>
        {zones.map(z => {
          const zCustoms = customAssets.filter(a => a.zoneId === z.id);
          return (
            <button
              key={z.id}
              onClick={() => setSelectedZoneId(z.id)}
              style={{ 
                padding: "12px 24px", borderRadius: "12px", border: `1px solid ${selectedZoneId === z.id ? COLORS.blue : COLORS.border}`,
                backgroundColor: selectedZoneId === z.id ? "rgba(96, 165, 250, 0.1)" : COLORS.card,
                color: selectedZoneId === z.id ? COLORS.blue : COLORS.dimText,
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: "8px"
              }}
            >
              {z.name}
              {zCustoms.length > 0 && (
                <span style={{ fontSize: "10px", backgroundColor: COLORS.purple, color: COLORS.bg, padding: "2px 6px", borderRadius: "10px", fontWeight: "bold" }}>
                  {zCustoms.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* BUILT-IN ASSET PREDICTIONS */}
      <SectionTitle color={COLORS.blue}>Infrastructure Load Forecasts</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px", marginBottom: "48px" }}>
        {Object.keys(ASSET_META).map(assetKey => {
          // Extract history for this specific asset in this zone
          // history is an object where keys are zone IDs, values are objects with asset keys as arrays
          const utilHistory = history[selectedZoneId]?.[assetKey] || [];
          const chartData = utilHistory.map((val: number, i: number) => ({ i, val }));
          const forecast = getForecast(utilHistory, STATUS_THRESHOLDS.critical);

          return (
            <div key={assetKey} style={{ backgroundColor: COLORS.card, borderRadius: "16px", border: `1px solid ${COLORS.border}`, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ color: (ASSET_META as any)[assetKey].color }}>{(ASSET_META as any)[assetKey].icon}</span>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>{(ASSET_META as any)[assetKey].label}</h3>
                  </div>
                  <div style={{ fontSize: "12px", color: COLORS.dimText }}>{selectedZone.name} · Real-time Analysis</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: COLORS.dimText, marginBottom: "4px" }}>BREACH FORECAST</div>
                  <div style={{ 
                    fontSize: "14px", fontWeight: "bold", 
                    color: forecast.status === 'High Risk' ? COLORS.red : forecast.status === 'Stable' ? COLORS.green : COLORS.amber 
                  }}>
                    {forecast.status} ({forecast.time})
                  </div>
                </div>
              </div>

              <div style={{ height: "200px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id={`grad-${assetKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={(ASSET_META as any)[assetKey].color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={(ASSET_META as any)[assetKey].color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                    <XAxis dataKey="i" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "8px" }}
                      itemStyle={{ color: COLORS.text }}
                    />
                    <ReferenceLine y={STATUS_THRESHOLDS.critical} stroke={COLORS.red} strokeDasharray="3 3" label={{ position: 'right', value: `${STATUS_THRESHOLDS.critical}%`, fill: COLORS.red, fontSize: 10 }} />
                    <Area type="monotone" dataKey="val" stroke={(ASSET_META as any)[assetKey].color} fillOpacity={1} fill={`url(#grad-${assetKey})`} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* CUSTOM MONITOR PREDICTIONS */}
      {zoneCustoms.length > 0 && (
        <>
          <SectionTitle color={COLORS.purple}>Custom Monitor Predictions</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
            {zoneCustoms.map(asset => {
              const utilHistory = customHistory[asset.id] || [];
              const chartData = utilHistory.map((val, i) => ({ i, val }));
              const forecast = getForecast(utilHistory, asset.alertThreshold);

              return (
                <div key={asset.id} style={{ backgroundColor: COLORS.card, borderRadius: "16px", border: `1px solid ${COLORS.purple}44`, padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Settings size={18} color={COLORS.purple} />
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>{asset.name}</h3>
                      </div>
                      <div style={{ fontSize: "12px", color: COLORS.dimText }}>
                        <span style={{ color: (ASSET_META as any)[asset.assetType].color }}>{(ASSET_META as any)[asset.assetType].icon}</span> {(ASSET_META as any)[asset.assetType].label} · Custom Monitor
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: COLORS.dimText, marginBottom: "4px" }}>BREACH FORECAST</div>
                      <div style={{ 
                        fontSize: "14px", fontWeight: "bold", 
                        color: forecast.status === 'High Risk' ? COLORS.red : forecast.status === 'Stable' ? COLORS.green : COLORS.amber 
                      }}>
                        {forecast.status} ({forecast.time})
                      </div>
                    </div>
                  </div>

                  <div style={{ height: "200px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id={`grad-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                        <XAxis dataKey="i" hide />
                        <YAxis domain={[0, 100]} hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "8px" }}
                          itemStyle={{ color: COLORS.text }}
                        />
                        <ReferenceLine y={asset.alertThreshold} stroke={COLORS.red} strokeDasharray="3 3" label={{ position: 'right', value: `${asset.alertThreshold}%`, fill: COLORS.red, fontSize: 10 }} />
                        <Area type="monotone" dataKey="val" stroke={COLORS.purple} fillOpacity={1} fill={`url(#grad-${asset.id})`} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
