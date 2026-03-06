import React from 'react';
import { MapPin, Info, AlertCircle, Phone } from 'lucide-react';
import { COLORS, EMERGENCY_CONTACTS } from '../../data/cityConstants';
import SectionTitle from '../shared/SectionTitle';
import ZoneCard from '../shared/ZoneCard';

export default function PublicPortal({ zones, user, avgUtilByZone }: { zones: any[], user: any, avgUtilByZone: any }) {
  const userZone = zones.find(z => z.name === user.zone) || zones[0];
  
  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      {/* HERO SECTION */}
      <div style={{ 
        backgroundColor: COLORS.card, 
        borderRadius: "24px", 
        padding: "40px", 
        border: `1px solid ${COLORS.border}`, 
        marginBottom: "40px",
        display: "flex",
        flexDirection: window.innerWidth < 768 ? "column" : "row",
        gap: "40px",
        alignItems: "center"
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: COLORS.blue, marginBottom: "16px" }}>
            <MapPin size={20} />
            <span style={{ fontWeight: "bold", letterSpacing: "1px", fontSize: "12px", textTransform: "uppercase" }}>YOUR NEIGHBOURHOOD</span>
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: "bold", color: COLORS.text, marginBottom: "16px" }}>{userZone.name}</h1>
          <p style={{ fontSize: "16px", color: COLORS.dimText, lineHeight: "1.6", marginBottom: "24px" }}>
            Currently monitoring {userZone.type.toLowerCase()} infrastructure. All systems are being reported in real-time by CityVitals.
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px 20px", borderRadius: "12px", border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: "10px", color: COLORS.dimText, marginBottom: "4px" }}>POPULATION</div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>{(userZone.population / 1000).toFixed(1)}k</div>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px 20px", borderRadius: "12px", border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: "10px", color: COLORS.dimText, marginBottom: "4px" }}>AVG LOAD</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: avgUtilByZone[userZone.id] >= 90 ? COLORS.red : avgUtilByZone[userZone.id] >= 75 ? COLORS.amber : COLORS.green }}>
                {Math.round(avgUtilByZone[userZone.id])}%
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: window.innerWidth < 768 ? "100%" : "350px" }}>
          <ZoneCard zone={userZone} highlighted={true} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 1024 ? "1fr" : "1fr 350px", gap: "40px" }}>
        {/* OTHER ZONES */}
        <div>
          <SectionTitle color={COLORS.dimText}>City-Wide Status</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {zones.filter(z => z.id !== userZone.id).map(z => (
              <ZoneCard key={z.id} zone={z} showDetails={false} />
            ))}
          </div>
        </div>

        {/* SIDEBAR: INFO & CONTACTS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <div style={{ backgroundColor: "rgba(96, 165, 250, 0.05)", borderRadius: "20px", border: `1px solid ${COLORS.blue}33`, padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: COLORS.blue, marginBottom: "16px" }}>
              <Info size={20} />
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>About CityVitals</span>
            </div>
            <p style={{ fontSize: "13px", color: COLORS.dimText, lineHeight: "1.6", margin: 0 }}>
              This portal provides transparent access to city infrastructure data. High utilization (above 75%) may lead to temporary service slowdowns.
            </p>
          </div>

          <div style={{ backgroundColor: COLORS.card, borderRadius: "20px", border: `1px solid ${COLORS.border}`, padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: COLORS.red, marginBottom: "20px" }}>
              <AlertCircle size={20} />
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>Emergency Contacts</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {Object.entries(EMERGENCY_CONTACTS).map(([key, val]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: COLORS.text, textTransform: "capitalize" }}>{key}</span>
                  <a 
                    href={`tel:${val}`} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "6px", 
                      color: COLORS.blue, 
                      textDecoration: "none", 
                      fontSize: "13px", 
                      fontWeight: "bold",
                      backgroundColor: "rgba(96, 165, 250, 0.1)",
                      padding: "4px 12px",
                      borderRadius: "20px"
                    }}
                  >
                    <Phone size={12} /> {val}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
