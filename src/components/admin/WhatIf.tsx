import React, { useState } from 'react';
import { Info, ArrowRight } from 'lucide-react';
import { COLORS, EVENT_LOADS, ASSET_META } from '../../data/cityConstants';
import SectionTitle from '../shared/SectionTitle';
import UtilBar from '../shared/UtilBar';

export default function WhatIf({ zones }: { zones: any[] }) {
  const [selectedEvent, setSelectedEvent] = useState<keyof typeof EVENT_LOADS>('none');
  
  const getSimulatedLoad = (zone: any, assetKey: string) => {
    const base = zone.assets[assetKey];
    const load = (EVENT_LOADS as any)[selectedEvent][assetKey];
    return Math.min(100, base + load);
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>What-If Scenario Engine</h2>
          <p style={{ color: COLORS.dimText, fontSize: "14px", marginTop: "4px" }}>
            Model the impact of city-wide events on infrastructure capacity.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 1024 ? "1fr" : "300px 1fr", gap: "32px" }}>
        {/* CONTROLS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ backgroundColor: COLORS.card, borderRadius: "12px", border: `1px solid ${COLORS.border}`, padding: "24px" }}>
            <SectionTitle color={COLORS.blue}>Select Scenario</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.keys(EVENT_LOADS).map(key => (
                <button
                  key={key}
                  onClick={() => setSelectedEvent(key as any)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: `1px solid ${selectedEvent === key ? COLORS.blue : COLORS.border}`,
                    backgroundColor: selectedEvent === key ? "rgba(96, 165, 250, 0.1)" : "transparent",
                    color: selectedEvent === key ? COLORS.blue : COLORS.dimText,
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    textTransform: "capitalize",
                    transition: "all 0.2s"
                  }}
                >
                  {key === 'none' ? 'Normal Operations' : key}
                </button>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: "rgba(167, 139, 250, 0.05)", border: `1px solid ${COLORS.purple}33`, borderRadius: "12px", padding: "20px" }}>
            <div style={{ display: "flex", gap: "10px", color: COLORS.purple, marginBottom: "12px" }}>
              <Info size={18} />
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>Scenario Impact</span>
            </div>
            <div style={{ fontSize: "12px", color: COLORS.dimText, lineHeight: "1.6" }}>
              This engine calculates additive load based on historical event patterns. Results are projections and do not affect live city data.
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {zones.map(z => (
            <div key={z.id} style={{ backgroundColor: COLORS.card, borderRadius: "12px", border: `1px solid ${COLORS.border}`, padding: "20px" }}>
              <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
                {z.name}
                <span style={{ fontSize: "10px", color: COLORS.dimText }}>{z.type}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {Object.keys(z.assets).map(key => {
                  const simVal = getSimulatedLoad(z, key);
                  const diff = simVal - z.assets[key];
                  return (
                    <div key={key}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px" }}>
                        <span style={{ color: COLORS.dimText, display: "flex", alignItems: "center", gap: "6px" }}>
                          {(ASSET_META as any)[key].icon} {(ASSET_META as any)[key].label}
                        </span>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={{ color: COLORS.dimText }}>{Math.round(z.assets[key])}%</span>
                          <ArrowRight size={10} color={COLORS.dimText} />
                          <span style={{ fontWeight: "bold", color: simVal >= 90 ? COLORS.red : simVal >= 75 ? COLORS.amber : COLORS.green }}>
                            {Math.round(simVal)}%
                          </span>
                          {diff > 0 && <span style={{ fontSize: "9px", color: COLORS.red }}>+{Math.round(diff)}%</span>}
                        </div>
                      </div>
                      <UtilBar value={simVal} height={6} animated={true} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
