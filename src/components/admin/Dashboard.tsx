import React from 'react';
import { AlertTriangle, Activity, Users, ShieldAlert, Settings, Globe } from 'lucide-react';
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

interface DashboardProps {
  zones: any[];
  health: number;
  criticalAssets: any[];
  warningAssets: any[];
  populationAtRisk: number;
  user: any;
  customAssets: any[];
  customUtilizations: Record<string, number>;
}

export default function Dashboard({ 
  zones, health, criticalAssets, warningAssets, populationAtRisk, user,
  customAssets, customUtilizations
}: DashboardProps) {
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  const customAlerts = customAssets.filter(a => (customUtilizations[a.id] || 0) >= a.alertThreshold);
  const customWarnings = customAssets.filter(a => {
    const util = customUtilizations[a.id] || 0;
    return util >= a.alertThreshold - 10 && util < a.alertThreshold;
  });

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <KPICard label="City Health" value={`${Math.round(health)}%`} color={health > 80 ? COLORS.green : health > 60 ? COLORS.amber : COLORS.red} icon={Activity} />
        <KPICard label="Critical Assets" value={criticalAssets.length + customAlerts.length} color={COLORS.red} icon={AlertTriangle} />
        <KPICard label="Warning Alerts" value={warningAssets.length + customWarnings.length} color={COLORS.amber} icon={ShieldAlert} />
        <KPICard label="Custom Monitors" value={customAssets.length} color={COLORS.purple} icon={Settings} />
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
              <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>ZONE / MONITOR</th>
              <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>ASSET TYPE</th>
              <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>LOAD</th>
              <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>STATUS</th>
              <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>IMPACT</th>
            </tr>
          </thead>
          <tbody>
            {/* Built-in Alerts */}
            {[...criticalAssets, ...warningAssets].map((item, idx) => (
              <tr key={`builtin-${idx}`} style={{ borderBottom: `1px solid ${COLORS.border}`, transition: "background 0.2s" }}>
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

            {/* Custom Alerts */}
            {[...customAlerts, ...customWarnings].map((asset, idx) => {
              const util = customUtilizations[asset.id] || 0;
              const isAlert = util >= asset.alertThreshold;
              return (
                <tr key={`custom-${idx}`} style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: "rgba(168, 85, 247, 0.02)" }}>
                  <td style={{ padding: "16px 24px", fontWeight: "bold" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: COLORS.purple }} />
                      {asset.name}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: (ASSET_META as any)[asset.assetType].color }}>{(ASSET_META as any)[asset.assetType].icon}</span>
                      {(ASSET_META as any)[asset.assetType].label}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", fontWeight: "bold", color: isAlert ? COLORS.red : COLORS.amber }}>
                    {Math.round(util)}%
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ 
                      display: "inline-block", padding: "4px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold",
                      backgroundColor: isAlert ? `${COLORS.red}22` : `${COLORS.amber}22`,
                      color: isAlert ? COLORS.red : COLORS.amber
                    }}>
                      {isAlert ? 'CRITICAL' : 'WARNING'}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", color: COLORS.dimText }}>
                    <span style={{ fontSize: "11px" }}>{asset.zoneName} · {asset.priority}</span>
                  </td>
                </tr>
              );
            })}

            {criticalAssets.length === 0 && warningAssets.length === 0 && customAlerts.length === 0 && customWarnings.length === 0 && (
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
