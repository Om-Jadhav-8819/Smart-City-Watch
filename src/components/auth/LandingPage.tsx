import React from 'react';
import { COLORS } from '../../data/cityConstants';

export default function LandingPage({ onSelectRole }: { onSelectRole: (role: string, type: string) => void }) {
  const cardStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
    textAlign: "center",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden"
  };

  const buttonStyle = (color: string): React.CSSProperties => ({
    padding: "14px 28px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: color,
    color: COLORS.bg,
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "24px",
    width: "220px",
    transition: "transform 0.2s"
  });

  const outlineButtonStyle = (color: string): React.CSSProperties => ({
    padding: "12px 26px",
    borderRadius: "8px",
    border: `2px solid ${color}`,
    backgroundColor: "transparent",
    color: color,
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "12px",
    width: "220px",
    transition: "background-color 0.2s, color 0.2s"
  });

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      width: "100vw", 
      backgroundColor: COLORS.bg,
      flexDirection: window.innerWidth < 768 ? "column" : "row"
    }}>
      {/* LEFT CARD - ADMIN */}
      <div 
        style={{ 
          ...cardStyle, 
          borderRight: window.innerWidth >= 768 ? `1px solid ${COLORS.border}` : "none",
          borderBottom: window.innerWidth < 768 ? `1px solid ${COLORS.border}` : "none",
          backgroundColor: "rgba(96, 165, 250, 0.02)"
        }}
      >
        <div style={{ fontSize: "80px", marginBottom: "24px" }}>🏛️</div>
        <h2 style={{ fontSize: "32px", fontWeight: "bold", color: COLORS.blue, marginBottom: "16px" }}>
          City Officials Portal
        </h2>
        <p style={{ fontSize: "16px", color: COLORS.dimText, maxWidth: "400px", lineHeight: "1.6" }}>
          Access live dashboards, predictions, and AI-assisted decision making.
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
          <button 
            onClick={() => onSelectRole('admin', 'signin')}
            style={buttonStyle(COLORS.blue)}
          >
            Sign In as Official
          </button>
          <button 
            onClick={() => onSelectRole('admin', 'signup')}
            style={outlineButtonStyle(COLORS.blue)}
          >
            Register as Official
          </button>
        </div>
        
        <div style={{ marginTop: "40px", fontSize: "11px", color: COLORS.dimText, letterSpacing: "1px", textTransform: "uppercase" }}>
          Restricted access · Government use only
        </div>
      </div>

      {/* RIGHT CARD - PUBLIC */}
      <div 
        style={{ 
          ...cardStyle,
          backgroundColor: "rgba(16, 185, 129, 0.02)"
        }}
      >
        <div style={{ fontSize: "80px", marginBottom: "24px" }}>👥</div>
        <h2 style={{ fontSize: "32px", fontWeight: "bold", color: COLORS.green, marginBottom: "16px" }}>
          Citizen Portal
        </h2>
        <p style={{ fontSize: "16px", color: COLORS.dimText, maxWidth: "400px", lineHeight: "1.6" }}>
          Check your neighbourhood status, report issues, and get instant AI assistance.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
          <button 
            onClick={() => onSelectRole('public', 'signin')}
            style={buttonStyle(COLORS.green)}
          >
            Sign In as Citizen
          </button>
          <button 
            onClick={() => onSelectRole('public', 'signup')}
            style={outlineButtonStyle(COLORS.green)}
          >
            Register as Citizen
          </button>
        </div>

        <div style={{ marginTop: "40px", fontSize: "11px", color: COLORS.dimText, letterSpacing: "1px", textTransform: "uppercase" }}>
          Free access · Open to all citizens
        </div>
      </div>
    </div>
  );
}
