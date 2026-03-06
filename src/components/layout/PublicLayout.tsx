import React, { useState, useRef, useEffect } from 'react';
import { LogOut, AlertTriangle, ChevronDown, User, Settings } from 'lucide-react';
import { COLORS } from '../../data/cityConstants';

export default function PublicLayout({ children, activeView, setView, user, onSignOut, criticalCount }: { children: React.ReactNode, activeView: string, setView: (v: string) => void, user: any, onSignOut: () => void, criticalCount: number }) {
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.bg, color: COLORS.text, display: "flex", flexDirection: "column" }}>
      {/* NAVBAR */}
      <nav style={{ height: "64px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", backgroundColor: COLORS.sidebar, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", display: "flex", gap: "4px" }}>
            <span style={{ color: COLORS.blue }}>City</span>
            <span style={{ color: COLORS.purple }}>Vitals</span>
          </div>
          <div style={{ fontSize: "10px", color: COLORS.dimText, letterSpacing: "1px", fontWeight: "bold", borderLeft: `1px solid ${COLORS.border}`, paddingLeft: "12px" }}>CITIZEN PORTAL</div>
        </div>

        <div style={{ display: "flex", backgroundColor: COLORS.bg, borderRadius: "24px", padding: "6px", border: `1px solid ${COLORS.border}` }}>
          <button 
            onClick={() => setView('portal')}
            style={{ 
              padding: "8px 20px", 
              borderRadius: "20px", 
              border: "none", 
              backgroundColor: activeView === 'portal' ? COLORS.card : "transparent", 
              color: activeView === 'portal' ? COLORS.blue : COLORS.dimText,
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            City Status
          </button>
          <button 
            onClick={() => setView('citizenbot')}
            style={{ 
              padding: "8px 20px", 
              borderRadius: "20px", 
              border: "none", 
              backgroundColor: activeView === 'citizenbot' ? COLORS.card : "transparent", 
              color: activeView === 'citizenbot' ? COLORS.blue : COLORS.dimText,
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            CityAssist AI
          </button>
        </div>

        <div ref={menuRef} style={{ display: "flex", alignItems: "center", gap: "16px", position: 'relative' }}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '12px',
              transition: 'background 0.2s',
              backgroundColor: showProfileMenu ? "rgba(255,255,255,0.03)" : "transparent"
            }}
          >
            <div style={{ textAlign: "right", display: window.innerWidth < 640 ? "none" : "block" }}>
              <div style={{ fontSize: "13px", fontWeight: "bold" }}>Hi, {user.name.split(' ')[0]}</div>
              <div style={{ fontSize: "10px", color: COLORS.dimText }}>{user.zone}</div>
            </div>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: COLORS.purple, color: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>
              {user.name[0]}
            </div>
            <ChevronDown size={14} color={COLORS.dimText} style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </div>

          {showProfileMenu && (
            <div style={{ 
              position: 'absolute', 
              top: 'calc(100% + 10px)', 
              right: '0', 
              width: '200px',
              backgroundColor: COLORS.sidebar, 
              border: `1px solid ${COLORS.border}`, 
              borderRadius: '12px', 
              padding: '8px', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
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
        </div>
      </nav>

      {/* ALERT BANNER */}
      {criticalCount > 0 && (
        <div style={{ backgroundColor: COLORS.red, color: COLORS.bg, padding: "10px 24px", display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", fontWeight: "bold" }}>
          <AlertTriangle size={18} />
          <span>Active infrastructure alerts in your city. Check status below or ask CityAssist for guidance.</span>
        </div>
      )}

      {/* CONTENT */}
      <main style={{ flex: 1, padding: "24px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
