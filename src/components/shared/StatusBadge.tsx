import React from 'react';
import { STATUS_THRESHOLDS, COLORS } from '../../data/cityConstants';

export default function StatusBadge({ utilization }: { utilization: number }) {
  const getStatus = () => {
    if (utilization >= STATUS_THRESHOLDS.critical) return { label: 'CRITICAL', color: COLORS.red };
    if (utilization >= STATUS_THRESHOLDS.warning) return { label: 'WARNING', color: COLORS.amber };
    return { label: 'NORMAL', color: COLORS.green };
  };

  const { label, color } = getStatus();

  return (
    <span style={{
      padding: "4px 8px",
      borderRadius: "4px",
      backgroundColor: `${color}22`,
      color: color,
      fontSize: "10px",
      fontWeight: "bold",
      letterSpacing: "0.5px",
      display: "inline-block"
    }}>
      {label}
    </span>
  );
}
