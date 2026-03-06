import React from 'react';
import { COLORS, STATUS_THRESHOLDS, ASSET_META } from '../../data/cityConstants';
import UtilBar from './UtilBar';

export default function ZoneCard({ zone, onClick, highlighted = false, showDetails = true }: { zone: any, onClick?: (id: number) => void, highlighted?: boolean, showDetails?: boolean, key?: React.Key }) {
  const avgUtil = Object.values(zone.assets).reduce((a: any, b: any) => a + b, 0) as number / 4;
  
  const getStatusColor = (val: number) => {
    if (val >= STATUS_THRESHOLDS.critical) return COLORS.red;
    if (val >= STATUS_THRESHOLDS.warning) return COLORS.amber;
    return COLORS.green;
  };

  const statusColor = getStatusColor(avgUtil);

  return (
    <div 
      onClick={() => onClick && onClick(zone.id)}
      style={{
        backgroundColor: COLORS.card,
        borderRadius: "12px",
        padding: "20px",
        border: `1px solid ${highlighted ? COLORS.blue : COLORS.border}`,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        position: "relative",
        boxShadow: highlighted ? `0 0 15px ${COLORS.blue}33` : "none"
      }}
    >
      {highlighted && (
        <div style={{
          position: "absolute",
          top: "-10px",
          right: "10px",
          backgroundColor: COLORS.blue,
          color: COLORS.bg,
          fontSize: "9px",
          fontWeight: "bold",
          padding: "2px 8px",
          borderRadius: "10px",
          letterSpacing: "0.5px"
        }}>
          YOUR AREA
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: COLORS.text }}>{zone.name}</div>
          <div style={{ fontSize: "10px", color: COLORS.dimText, textTransform: "uppercase", marginTop: "2px" }}>{zone.type}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: statusColor }}>{Math.round(avgUtil)}%</div>
          <div style={{ fontSize: "9px", color: COLORS.dimText }}>AVG LOAD</div>
        </div>
      </div>

      {showDetails && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {Object.entries(zone.assets).map(([key, val]: [string, any]) => (
            <div key={key}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "9px" }}>
                <span style={{ color: COLORS.dimText, display: "flex", alignItems: "center", gap: "4px" }}>
                  {(ASSET_META as any)[key].icon} {key.toUpperCase()}
                </span>
                <span style={{ color: getStatusColor(val), fontWeight: "bold" }}>{Math.round(val)}%</span>
              </div>
              <UtilBar value={val} height={4} animated={false} />
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "10px", color: COLORS.dimText }}>
          Pop: {(zone.population / 1000).toFixed(1)}k
        </div>
        <div style={{ 
          width: "8px", 
          height: "8px", 
          borderRadius: "50%", 
          backgroundColor: statusColor,
          boxShadow: `0 0 8px ${statusColor}`
        }} />
      </div>
    </div>
  );
}
