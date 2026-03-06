import React from 'react';
import { STATUS_THRESHOLDS, COLORS } from '../../data/cityConstants';

export default function UtilBar({ value, height = 6, showLabel = false, animated = true }: { value: number, height?: number, showLabel?: boolean, animated?: boolean }) {
  const getColor = (val: number) => {
    if (val >= STATUS_THRESHOLDS.critical) return COLORS.red;
    if (val >= STATUS_THRESHOLDS.warning) return COLORS.amber;
    return COLORS.green;
  };

  const color = getColor(value);

  return (
    <div style={{ width: "100%" }}>
      {showLabel && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "10px" }}>
          <span style={{ color: COLORS.dimText }}>UTILIZATION</span>
          <span style={{ color: color, fontWeight: "bold" }}>{Math.round(value)}%</span>
        </div>
      )}
      <div style={{ 
        width: "100%", 
        height: `${height}px`, 
        backgroundColor: "rgba(255,255,255,0.05)", 
        borderRadius: `${height / 2}px`, 
        overflow: "hidden" 
      }}>
        <div style={{ 
          width: `${value}%`, 
          height: "100%", 
          backgroundColor: color, 
          borderRadius: `${height / 2}px`,
          transition: animated ? "width 0.8s ease-in-out, background-color 0.5s ease" : "none"
        }} />
      </div>
    </div>
  );
}
