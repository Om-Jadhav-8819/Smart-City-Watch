import React, { useState, useRef, useEffect } from 'react';
import { LogOut, AlertCircle, Clock, ChevronUp, User, Settings } from 'lucide-react';
import { COLORS } from '../../data/cityConstants';
import SectionTitle from '../shared/SectionTitle';

export default function AdminLayout({ children, activeView, setView, user, onSignOut, simHour, healthScore, criticalCount }: { children: React.ReactNode, activeView: string, setView: (v: string) => void, user: any, onSignOut: () => void, simHour: number, healthScore: number, criticalCount: number }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { id: "dashboard",   label: "Live Dashboard",  icon: "◈" },
    { id: "predictions", label: "Predictions",      icon: "◉" },
    { id: "whatif",      label: "What-If Engine",   icon: "◇" },
    { id: "zones",       label: "Zone Manager",     icon: "⊞" },
    { id: "adminbot",    label: "AI Assistant",     icon: "🤖" }
  ];

  const getHealthColor = (score: number) => {
    if (score < 60) return COLORS.red;
    if (score < 80) return COLORS.amber;
    return COLORS.green;
  };

  const getHealthLabel = (score: number) => {
    if (score < 60) return "CRITICAL";
    if (score < 80) return "STRESSED";
    return "GOOD";
  };

  const healthColor = getHealthColor(healthScore);

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: COLORS.bg, color: COLORS.text, overflow: "hidden" }}>
      {/* SIDEBAR */}
      <div style={{ width: "260px", backgroundColor: COLORS.sidebar, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px" }}>
          <div style={{ fontSize: "22px", fontWeight: "bold", display: "flex", gap: "4px" }}>
            <span style={{ color: COLORS.blue }}>City</span>
            <span style={{ color: COLORS.purple }}>Vitals</span>
          </div>
          <div style={{ fontSize: "9px", color: COLORS.dimText, letterSpacing: "1.5px", marginTop: "4px", fontWeight: "bold" }}>ADMIN COMMAND CENTER</div>
        </div>

        <div style={{ flex: 1, padding: "0 10px" }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: activeView === item.id ? "rgba(96, 165, 250, 0.12)" : "transparent",
                color: activeView === item.id ? COLORS.blue : COLORS.dimText,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeView === item.id ? "600" : "400",
                textAlign: "left",
                transition: "all 0.2s",
                marginBottom: "4px"
              }}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* User Info */}
        <div ref={menuRef} style={{ padding: "16px 10px", borderTop: `1px solid ${COLORS.border}`, position: 'relative' }}>
          {showProfileMenu && (
            <div style={{ 
              position: 'absolute', 
              bottom: 'calc(100% - 10px)', 
              left: '10px', 
              right: '10px', 
              backgroundColor: COLORS.sidebar, 
              border: `1px solid ${COLORS.border}`, 
              borderRadius: '12px', 
              padding: '8px', 
              boxShadow: '0 -8px 24px rgba(0,0,0,0.3)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ padding: '8px 12px', borderBottom: `1px solid ${COLORS.border}`, marginBottom: '4px' }}>
                <div style={{ fontSize: '11px', color: COLORS.dimText, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account</div>
              </div>
              <button 
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: COLORS.dimText, cursor: "pointer", fontSize: "13px", textAlign: "left" }}
                onClick={() => { setView('profile'); setShowProfileMenu(false); }}
              >
                <User size={16} /> View Profile
              </button>
              <button 
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: COLORS.dimText, cursor: "pointer", fontSize: "13px", textAlign: "left" }}
                onClick={() => setShowProfileMenu(false)}
              >
                <Settings size={16} /> Settings
              </button>
              <div style={{ height: '1px', backgroundColor: COLORS.border, margin: '4px 0' }} />
              <button 
                onClick={onSignOut}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: COLORS.red, cursor: "pointer", fontSize: "13px", fontWeight: 'bold', textAlign: "left" }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}

          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              padding: "10px",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "background 0.2s",
              backgroundColor: showProfileMenu ? "rgba(255,255,255,0.03)" : "transparent"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showProfileMenu ? "rgba(255,255,255,0.03)" : "transparent"}
          >
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: COLORS.blue, color: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", flexShrink: 0 }}>
              {user.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: "10px", color: COLORS.dimText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.department}</div>
            </div>
            <ChevronUp size={14} color={COLORS.dimText} style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* HEADER */}
        <header style={{ height: "64px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0, backgroundColor: COLORS.sidebar }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "12px", color: COLORS.dimText }}>
                ADMIN <span style={{ margin: "0 8px" }}>/</span> <span style={{ color: COLORS.text, fontWeight: "bold" }}>{navItems.find(n => n.id === activeView)?.label.toUpperCase()}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: COLORS.green }} />
                <span style={{ fontSize: "10px", fontWeight: "bold", color: COLORS.green, letterSpacing: "1px" }}>LIVE</span>
              </div>
            </div>

            <div style={{ height: "24px", width: "1px", backgroundColor: COLORS.border }} />

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: COLORS.dimText }}>
              <Clock size={16} />
              <span style={{ fontSize: "16px", fontWeight: "bold", color: COLORS.text }}>{String(simHour).padStart(2, '0')}:00</span>
              <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>{simHour >= 6 && simHour < 18 ? 'Daylight Cycle' : 'Night Cycle'}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.03)", padding: "4px 12px", borderRadius: "8px", border: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: "10px", color: COLORS.dimText, fontWeight: "bold", letterSpacing: "0.5px" }}>HEALTH</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: healthColor }}>{healthScore}%</span>
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: healthColor }} />
            </div>

            {criticalCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: `${COLORS.red}22`, padding: "4px 12px", borderRadius: "20px", border: `1px solid ${COLORS.red}44` }}>
                <AlertCircle size={14} color={COLORS.red} />
                <span style={{ fontSize: "11px", fontWeight: "bold", color: COLORS.red }}>{criticalCount} CRITICAL ALERTS</span>
              </div>
            )}
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
