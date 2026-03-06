import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import { COLORS, ASSET_META, STATUS_THRESHOLDS } from '../../data/cityConstants';
import SectionTitle from '../shared/SectionTitle';

export default function Predictions({ zones, history }: { zones: any[], history: any }) {
  const breachForecast = useMemo(() => {
    const forecasts: any[] = [];
    zones.forEach(z => {
      Object.keys(z.assets).forEach(a => {
        const h = history[z.id]?.[a] || [];
        if (h.length < 10) return;
        
        // Simple Linear Regression for next 10 ticks
        const n = h.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        h.forEach((y: number, x: number) => {
          sumX += x;
          sumY += y;
          sumXY += x * y;
          sumXX += x * x;
        });
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const nextVal = slope * (n + 10) + intercept;
        if (nextVal >= STATUS_THRESHOLDS.critical) {
          const ticksToBreach = Math.max(1, Math.round((STATUS_THRESHOLDS.critical - h[n-1]) / (slope || 0.1)));
          if (ticksToBreach < 30) {
            forecasts.push({ zone: z.name, asset: a, current: h[n-1], trend: slope > 0 ? 'UP' : 'DOWN', time: ticksToBreach * 2 });
          }
        }
      });
    });
    return forecasts.sort((a, b) => a.time - b.time);
  }, [zones, history]);

  const chartData = useMemo(() => {
    const data: any[] = [];
    for (let i = 0; i < 30; i++) {
      const entry: any = { name: i };
      zones.forEach(z => {
        const avg = Object.keys(z.assets).reduce((acc, a) => acc + (history[z.id]?.[a]?.[i] || 0), 0) / 4;
        entry[z.name] = avg;
      });
      data.push(entry);
    }
    return data;
  }, [zones, history]);

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ backgroundColor: "rgba(96, 165, 250, 0.05)", border: `1px solid ${COLORS.blue}33`, borderRadius: "12px", padding: "16px", marginBottom: "32px" }}>
        <p style={{ margin: 0, fontSize: "14px", color: COLORS.blue }}>
          <strong>Predictive Analysis:</strong> Our engine uses real-time linear regression to forecast potential infrastructure breaches within the next 60 minutes.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 1024 ? "1fr" : "1fr 350px", gap: "24px" }}>
        {/* CHARTS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ backgroundColor: COLORS.card, borderRadius: "12px", border: `1px solid ${COLORS.border}`, padding: "24px" }}>
            <SectionTitle color={COLORS.purple}>Aggregate Zone Trends (Last 60m)</SectionTitle>
            <div style={{ height: "350px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.dimBorder} vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis domain={[0, 100]} stroke={COLORS.dimText} fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "8px" }}
                    itemStyle={{ fontSize: "12px" }}
                  />
                  {zones.map((z, i) => (
                    <Line 
                      key={z.id} 
                      type="monotone" 
                      dataKey={z.name} 
                      stroke={[COLORS.blue, COLORS.purple, COLORS.teal, COLORS.green, COLORS.amber, COLORS.red, "#EC4899", "#8B5CF6", "#F97316"][i]} 
                      dot={false} 
                      strokeWidth={2}
                    />
                  ))}
                  <ReferenceLine y={STATUS_THRESHOLDS.critical} stroke={COLORS.red} strokeDasharray="5 5" label={{ position: 'right', value: 'CRITICAL', fill: COLORS.red, fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ backgroundColor: COLORS.card, borderRadius: "12px", border: `1px solid ${COLORS.border}`, padding: "24px" }}>
            <SectionTitle color={COLORS.teal}>System Load Distribution</SectionTitle>
            <div style={{ height: "200px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="City Core" stroke={COLORS.teal} fillOpacity={1} fill="url(#colorUtil)" />
                  <Tooltip />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BREACH FORECAST LIST */}
        <div style={{ backgroundColor: COLORS.card, borderRadius: "12px", border: `1px solid ${COLORS.border}`, padding: "24px", height: "fit-content" }}>
          <SectionTitle color={COLORS.red}>Breach Forecast</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {breachForecast.length > 0 ? breachForecast.map((f, i) => (
              <div key={i} style={{ padding: "16px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.05)", border: `1px solid ${COLORS.red}22` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>{f.zone}</span>
                  <span style={{ color: COLORS.red, fontSize: "12px", fontWeight: "bold" }}>IN ~{f.time} MIN</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: COLORS.dimText }}>
                  <span style={{ color: (ASSET_META as any)[f.asset].color }}>{(ASSET_META as any)[f.asset].icon}</span>
                  {(ASSET_META as any)[f.asset].label} breach predicted
                </div>
                <div style={{ marginTop: "12px", width: "100%", height: "4px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                  <div style={{ width: `${f.current}%`, height: "100%", backgroundColor: COLORS.red, borderRadius: "2px" }} />
                </div>
              </div>
            )) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.dimText }}>
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>🛡️</div>
                <div style={{ fontSize: "12px" }}>No imminent breaches detected in the next 60 minutes.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
