import React from 'react';
import { AlertTriangle, Activity, Users, ShieldAlert } from 'lucide-react';
import { COLORS, ASSET_META } from '../../data/cityConstants';
import SectionTitle from '../shared/SectionTitle';
import ZoneCard from '../shared/ZoneCard';
import StatusBadge from '../shared/StatusBadge';

const KPICard = ({ label, value, color, icon: Icon }: { label: string, value: string | number, color: string, icon: any }) => (
  <div style={{ backgroundColor: COLORS.card, padding: "24px", borderRadius: "12px", border: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
    <div>
      <div style={{ fontSize: "11px", color: COLORS.dimText, marginBottom: "8px", letterSpacing: "1px" }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: "32px", fontWeight: "bold", color }}>{value}</div>
    </div>
    <div style={{ color: `${color}66` }}><Icon size={24} /></div>
  </div>
);

export default function Dashboard({ zones, health, criticalAssets, warningAssets, populationAtRisk, user }: { zones: any[], health: number, criticalAssets: any[], warningAssets: any[], populationAtRisk: number, user: any }) {
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: COLORS.text, margin: 0 }}>
          Good {getTimeGreeting()}, {user.name.split(' ')[0]}
        </h1>
        <p style={{ color: COLORS.dimText, fontSize: "14px", marginTop: "4px" }}>
          Monitoring oversight for <span style={{ color: COLORS.blue, fontWeight: "bold" }}>{user.department}</span>
        </p>
      </div>

      {/* KPI GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <KPICard label="City Health" value={`${Math.round(health)}%`} color={health > 80 ? COLORS.green : health > 60 ? COLORS.amber : COLORS.red} icon={Activity} />
        <KPICard label="Critical Assets" value={criticalAssets.length} color={COLORS.red} icon={AlertTriangle} />
        <KPICard label="Warning Alerts" value={warningAssets.length} color={COLORS.amber} icon={ShieldAlert} />
        <KPICard label="Pop. At Risk" value={`${(populationAtRisk / 1000).toFixed(1)}k`} color={COLORS.purple} icon={Users} />
      </div>

      {/* HEATMAP SECTION */}
      <SectionTitle color={COLORS.blue}>Infrastructure Heatmap</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        {zones.map(z => (
          <ZoneCard key={z.id} zone={z} />
        ))}
      </div>

      {/* TRIAGE TABLE */}
      <SectionTitle color={COLORS.amber}>Active Triage Queue</SectionTitle>
      <div style={{ backgroundColor: COLORS.card, borderRadius: "12px", border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: "rgba(255,255,255,0.02)" }}>
              <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>ZONE</th>
              <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>ASSET TYPE</th>
              <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>LOAD</th>
              <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>STATUS</th>
              <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>IMPACT</th>
            </tr>
          </thead>
          <tbody>
            {[...criticalAssets, ...warningAssets].map((item, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}`, transition: "background 0.2s" }}>
                <td style={{ padding: "16px 24px", fontWeight: "bold" }}>{item.zone}</td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: (ASSET_META as any)[item.type].color }}>{(ASSET_META as any)[item.type].icon}</span>
                    {(ASSET_META as any)[item.type].label}
                  </div>
                </td>
                <td style={{ padding: "16px 24px", fontWeight: "bold", color: item.utilization >= 90 ? COLORS.red : COLORS.amber }}>
                  {Math.round(item.utilization)}%
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <StatusBadge utilization={item.utilization} />
                </td>
                <td style={{ padding: "16px 24px", color: COLORS.dimText }}>
                  ~{Math.round(item.population / 1000)}k citizens
                </td>
              </tr>
            ))}
            {criticalAssets.length === 0 && warningAssets.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: COLORS.dimText }}>
                  No active infrastructure alerts. City systems are operating within normal parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
