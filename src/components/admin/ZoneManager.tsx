import React, { useState, useEffect, useMemo } from 'react';
import { Edit2, Plus, Trash2, Save, X, Info, Activity, History, Settings, AlertCircle, TrendingUp, TrendingDown, Minus, Globe } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { COLORS, ZONE_NAMES, ASSET_META, CUSTOM_ASSET_DEFAULTS } from '../../data/cityConstants';
import SectionTitle from '../shared/SectionTitle';

interface ZoneManagerProps {
  zones: any[];
  history: any;
  updateZone: (id: number, updates: any, userName: string) => void;
  user: any;
  customAssets: any[];
  customUtilizations: Record<string, number>;
  customHistory: Record<string, number[]>;
  addCustomAsset: (assetData: any, userName: string) => void;
  updateCustomAsset: (id: string, updates: any, userName: string) => void;
  deleteCustomAsset: (id: string, userName: string) => void;
}

export default function ZoneManager({ 
  zones, history, updateZone, user, 
  customAssets, customUtilizations, customHistory,
  addCustomAsset, updateCustomAsset, deleteCustomAsset 
}: ZoneManagerProps) {
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom' | 'audit'>('builtin');
  const [editingZoneId, setEditingZoneId] = useState<number | null>(null);
  const [editingAssetKey, setEditingAssetKey] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  const [newMonitor, setNewMonitor] = useState({
    name: '',
    zoneId: 0,
    zoneName: ZONE_NAMES[0],
    assetType: 'roads',
    description: '',
    priority: 'Medium',
    alertThreshold: 88,
    department: user.department,
    createdBy: user.name
  });

  useEffect(() => {
    const loadAudit = () => {
      try {
        const audit = JSON.parse(localStorage.getItem('cityvitals_audit') || '[]');
        setAuditLog(audit);
      } catch (e) { console.error(e); }
    };
    loadAudit();
    const interval = setInterval(loadAudit, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleEditZoneAsset = (zone: any, assetKey: string) => {
    setEditingZoneId(zone.id);
    setEditingAssetKey(assetKey);
    setEditData({
      threshold: zone.threshold || 90,
      notes: zone.notes || "",
      priority: zone.priority || "Medium"
    });
  };

  const handleSaveZoneAsset = () => {
    if (editingZoneId === null) return;
    updateZone(editingZoneId, editData, user.name);
    setEditingZoneId(null);
    setEditingAssetKey(null);
  };

  const handleAddMonitorSubmit = () => {
    addCustomAsset(newMonitor, user.name);
    setShowAddModal(false);
    setNewMonitor({
      name: '',
      zoneId: 0,
      zoneName: ZONE_NAMES[0],
      assetType: 'roads',
      description: '',
      priority: 'Medium',
      alertThreshold: 88,
      department: user.department,
      createdBy: user.name
    });
  };

  const getTrend = (history: number[]) => {
    if (history.length < 5) return 'stable';
    const last5 = history.slice(-5);
    const avgRecent = (last5[3] + last5[4]) / 2;
    const avgOlder = (last5[0] + last5[1] + last5[2]) / 3;
    if (avgRecent > avgOlder + 0.5) return 'up';
    if (avgRecent < avgOlder - 0.5) return 'down';
    return 'stable';
  };

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>Zone & Asset Manager</h2>
          <p style={{ color: COLORS.dimText, fontSize: "14px", marginTop: "4px" }}>Manage infrastructure thresholds and custom monitoring points.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "8px", backgroundColor: COLORS.blue, color: COLORS.bg, border: "none", cursor: "pointer", fontWeight: "bold" }}
        >
          <Plus size={18} /> Add Asset Monitor
        </button>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: "12px" }}>
        {[
          { id: 'builtin', label: 'Built-in Assets', icon: Activity },
          { id: 'custom', label: 'Custom Monitors', icon: Settings },
          { id: 'audit', label: 'Audit Log', icon: History }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{ 
              display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "6px",
              backgroundColor: activeTab === tab.id ? "rgba(96, 165, 250, 0.1)" : "transparent",
              color: activeTab === tab.id ? COLORS.blue : COLORS.dimText,
              border: "none", cursor: "pointer", fontWeight: activeTab === tab.id ? "bold" : "normal",
              transition: "all 0.2s"
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'builtin' && (
        <div style={{ backgroundColor: COLORS.card, borderRadius: "12px", border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: "rgba(255,255,255,0.02)" }}>
                <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>ZONE</th>
                <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>ASSET TYPE</th>
                <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>LIVE %</th>
                <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>STATUS</th>
                <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>TREND</th>
                <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>THRESHOLD</th>
                <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(z => Object.keys(z.assets).map(assetKey => {
                const util = z.assets[assetKey];
                const trend = getTrend(customHistory[z.id] || []); // Using zone history logic
                const isEditing = editingZoneId === z.id && editingAssetKey === assetKey;

                return (
                  <React.Fragment key={`${z.id}-${assetKey}`}>
                    <tr style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: isEditing ? "rgba(96, 165, 250, 0.05)" : "transparent" }}>
                      <td style={{ padding: "16px 24px", fontWeight: "bold" }}>{z.name}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: (ASSET_META as any)[assetKey].color }}>{(ASSET_META as any)[assetKey].icon}</span>
                          {(ASSET_META as any)[assetKey].label}
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontWeight: "bold", fontSize: "16px", color: util >= 90 ? COLORS.red : util >= 75 ? COLORS.amber : COLORS.green }}>
                            {Math.round(util)}%
                          </span>
                          <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "16px" }}>
                            {(history[z.id]?.[assetKey as any] || [util]).slice(-5).map((h, i) => (
                              <div key={i} style={{ width: "3px", height: `${h/4}px`, backgroundColor: h >= 90 ? COLORS.red : h >= 75 ? COLORS.amber : COLORS.dimText, borderRadius: "1px" }} />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ 
                          display: "inline-block", padding: "4px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold",
                          backgroundColor: util >= 90 ? `${COLORS.red}22` : util >= 75 ? `${COLORS.amber}22` : `${COLORS.green}22`,
                          color: util >= 90 ? COLORS.red : util >= 75 ? COLORS.amber : COLORS.green
                        }}>
                          {util >= 90 ? 'CRITICAL' : util >= 75 ? 'WARNING' : 'STABLE'}
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        {trend === 'up' && <TrendingUp size={16} color={COLORS.red} />}
                        {trend === 'down' && <TrendingDown size={16} color={COLORS.green} />}
                        {trend === 'stable' && <Minus size={16} color={COLORS.dimText} />}
                      </td>
                      <td style={{ padding: "16px 24px", color: COLORS.dimText }}>{z.threshold || 90}%</td>
                      <td style={{ padding: "16px 24px" }}>
                        <button 
                          onClick={() => handleEditZoneAsset(z, assetKey)}
                          style={{ background: "none", border: "none", color: COLORS.blue, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "bold" }}
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                      </td>
                    </tr>
                    {isEditing && (
                      <tr style={{ backgroundColor: "rgba(96, 165, 250, 0.02)" }}>
                        <td colSpan={7} style={{ padding: "24px", borderBottom: `1px solid ${COLORS.border}` }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
                            <div>
                              <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>ALERT THRESHOLD ({editData.threshold}%)</label>
                              <input 
                                type="range" min="75" max="95" value={editData.threshold}
                                onChange={e => setEditData({...editData, threshold: parseInt(e.target.value)})}
                                style={{ width: "100%", accentColor: COLORS.blue }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>PRIORITY LEVEL</label>
                              <div style={{ display: "flex", gap: "8px" }}>
                                {['Low', 'Medium', 'High', 'Critical Watch'].map(p => (
                                  <button
                                    key={p}
                                    onClick={() => setEditData({...editData, priority: p})}
                                    style={{ 
                                      padding: "6px 12px", borderRadius: "4px", fontSize: "11px", border: "none", cursor: "pointer",
                                      backgroundColor: editData.priority === p ? COLORS.blue : COLORS.sidebar,
                                      color: editData.priority === p ? COLORS.bg : COLORS.dimText
                                    }}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                              <button onClick={handleSaveZoneAsset} style={{ flex: 1, padding: "10px", borderRadius: "6px", backgroundColor: COLORS.blue, color: COLORS.bg, border: "none", fontWeight: "bold", cursor: "pointer" }}>Save Changes</button>
                              <button onClick={() => setEditingZoneId(null)} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "transparent", color: COLORS.dimText, border: `1px solid ${COLORS.border}`, cursor: "pointer" }}>Cancel</button>
                            </div>
                            <div style={{ gridColumn: "span 3" }}>
                              <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>OFFICIAL NOTES</label>
                              <textarea 
                                value={editData.notes}
                                onChange={e => setEditData({...editData, notes: e.target.value})}
                                style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "12px", color: COLORS.text, fontSize: "13px", height: "60px", resize: "none" }}
                                placeholder="Add context for this asset..."
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'custom' && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "14px", color: COLORS.dimText }}>
              <span style={{ color: COLORS.purple, fontWeight: "bold" }}>{customAssets.length}</span> custom monitors active
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "6px", backgroundColor: "transparent", color: COLORS.blue, border: `1px solid ${COLORS.blue}`, cursor: "pointer", fontSize: "13px" }}
            >
              <Plus size={16} /> Add Monitor
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: "20px" }}>
            {customAssets.map(asset => {
              const util = customUtilizations[asset.id] || 50;
              const history = customHistory[asset.id] || [util];
              const isAlerting = util >= asset.alertThreshold;
              const isWarning = util >= asset.alertThreshold - 10;

              return (
                <div key={asset.id} style={{ 
                  backgroundColor: COLORS.card, borderRadius: "12px", border: `1px solid ${isAlerting ? COLORS.red : COLORS.border}`, 
                  padding: "20px", position: "relative", transition: "all 0.3s",
                  boxShadow: isAlerting ? `0 0 20px ${COLORS.red}22` : "none"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <div style={{ 
                          padding: "2px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: "bold",
                          backgroundColor: asset.priority === 'Critical Watch' ? COLORS.red : asset.priority === 'High' ? COLORS.amber : COLORS.dimBorder,
                          color: asset.priority === 'Critical Watch' || asset.priority === 'High' ? COLORS.bg : COLORS.dimText
                        }}>
                          {asset.priority.toUpperCase()}
                        </div>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>{asset.name}</h3>
                      </div>
                      <div style={{ fontSize: "12px", color: COLORS.dimText, display: "flex", alignItems: "center", gap: "6px" }}>
                        <Globe size={12} /> {asset.zoneName} · <span style={{ color: (ASSET_META as any)[asset.assetType].color }}>{(ASSET_META as any)[asset.assetType].icon}</span> {(ASSET_META as any)[asset.assetType].label}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => setEditingCustomId(asset.id)} style={{ background: "none", border: "none", color: COLORS.dimText, cursor: "pointer" }}><Edit2 size={14} /></button>
                      <button onClick={() => { if(confirm(`Delete ${asset.name}?`)) deleteCustomAsset(asset.id, user.name) }} style={{ background: "none", border: "none", color: COLORS.dimText, cursor: "pointer" }}><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "20px", fontWeight: "bold", color: isAlerting ? COLORS.red : isWarning ? COLORS.amber : COLORS.green }}>
                          {Math.round(util)}%
                        </span>
                        <span style={{ fontSize: "11px", color: COLORS.dimText }}>LIVE UTILIZATION</span>
                      </div>
                      {isAlerting && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: COLORS.red, fontSize: "11px", fontWeight: "bold", animation: "pulse 1s infinite" }}>
                          <AlertCircle size={14} /> ALERT BREACH
                        </div>
                      )}
                    </div>
                    <div style={{ width: "100%", height: "8px", backgroundColor: COLORS.sidebar, borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ 
                        width: `${util}%`, height: "100%", 
                        backgroundColor: isAlerting ? COLORS.red : isWarning ? COLORS.amber : COLORS.green,
                        transition: "width 1s ease-in-out"
                      }} />
                    </div>
                  </div>

                  <div style={{ height: "50px", width: "100%", marginBottom: "16px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history.map((v, i) => ({ v, i }))}>
                        <Line type="monotone" dataKey="v" stroke={isAlerting ? COLORS.red : COLORS.blue} strokeWidth={2} dot={false} />
                        <YAxis domain={[0, 100]} hide />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <p style={{ fontSize: "12px", color: COLORS.dimText, margin: "0 0 16px 0", lineHeight: "1.5" }}>
                    {asset.description || "No description provided."}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: COLORS.dimText, borderTop: `1px solid ${COLORS.border}`, paddingTop: "12px" }}>
                    <div>DEPT: <span style={{ color: COLORS.text }}>{asset.department}</span> · BY: <span style={{ color: COLORS.text }}>{asset.createdBy}</span></div>
                    <div>ADDED: {formatRelativeTime(asset.createdAt)}</div>
                  </div>
                </div>
              );
            })}
            {customAssets.length === 0 && (
              <div style={{ gridColumn: "1 / -1", padding: "60px", textAlign: "center", backgroundColor: "rgba(255,255,255,0.01)", borderRadius: "12px", border: `1px dashed ${COLORS.border}` }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>📡</div>
                <h3 style={{ color: COLORS.text, margin: "0 0 8px 0" }}>No custom monitors added yet</h3>
                <p style={{ color: COLORS.dimText, maxWidth: "400px", margin: "0 auto 24px auto", fontSize: "14px" }}>
                  Add monitors for specific infrastructure points like pumping stations, substations, or construction zones to get granular live data.
                </p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  style={{ padding: "12px 24px", borderRadius: "8px", backgroundColor: COLORS.blue, color: COLORS.bg, border: "none", cursor: "pointer", fontWeight: "bold" }}
                >
                  + Add Your First Monitor
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div style={{ backgroundColor: COLORS.card, borderRadius: "12px", border: `1px solid ${COLORS.border}`, padding: "24px" }}>
          <SectionTitle color={COLORS.dimText}>System Audit Log</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {auditLog.map((log, i) => {
              let icon = <Activity size={14} color={COLORS.blue} />;
              const msg = log.message || '';
              if (msg.includes('added')) icon = <Plus size={14} color={COLORS.green} />;
              if (msg.includes('deleted')) icon = <Trash2 size={14} color={COLORS.red} />;
              if (msg.includes('updated')) icon = <Edit2 size={14} color={COLORS.amber} />;

              return (
                <div key={log.id || i} style={{ display: "flex", gap: "16px", padding: "16px", borderRadius: "8px", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}` }}>
                  <div style={{ marginTop: "2px" }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontWeight: "bold", fontSize: "13px" }}>{log.userName}</span>
                      <span style={{ fontSize: "11px", color: COLORS.dimText }}>{new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: COLORS.dimText }}>{log.message}</div>
                  </div>
                </div>
              );
            })}
            {auditLog.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: COLORS.dimText }}>No audit entries found.</div>
            )}
          </div>
        </div>
      )}

      {/* ADD MONITOR MODAL */}
      {showAddModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", backdropFilter: "blur(4px)" }}>
          <div style={{ backgroundColor: COLORS.card, borderRadius: "16px", border: `1px solid ${COLORS.border}`, width: "100%", maxWidth: "600px", overflow: "hidden", animation: "slideUp 0.3s ease-out" }}>
            <div style={{ padding: "24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>Add Custom Asset Monitor</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: COLORS.dimText, cursor: "pointer" }}><X size={24} /></button>
            </div>
            
            <div style={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>MONITOR NAME</label>
                  <input 
                    type="text" placeholder="e.g. Yamuna Pumping Station, Sector 4 Substation"
                    value={newMonitor.name}
                    onChange={e => setNewMonitor({...newMonitor, name: e.target.value})}
                    style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "12px", color: COLORS.text, fontSize: "14px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>ZONE</label>
                    <select 
                      value={newMonitor.zoneId}
                      onChange={e => setNewMonitor({...newMonitor, zoneId: parseInt(e.target.value), zoneName: ZONE_NAMES[parseInt(e.target.value)]})}
                      style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "12px", color: COLORS.text, fontSize: "14px" }}
                    >
                      {ZONE_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>ASSET TYPE</label>
                    <select 
                      value={newMonitor.assetType}
                      onChange={e => setNewMonitor({...newMonitor, assetType: e.target.value})}
                      style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "12px", color: COLORS.text, fontSize: "14px" }}
                    >
                      {Object.keys(ASSET_META).map(key => <option key={key} value={key}>{(ASSET_META as any)[key].label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>DESCRIPTION</label>
                  <textarea 
                    placeholder="Add context about this specific infrastructure point..."
                    value={newMonitor.description}
                    onChange={e => setNewMonitor({...newMonitor, description: e.target.value})}
                    style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "12px", color: COLORS.text, fontSize: "14px", height: "80px", resize: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "12px" }}>PRIORITY LEVEL</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {['Low', 'Medium', 'High', 'Critical Watch'].map(p => (
                      <button
                        key={p}
                        onClick={() => setNewMonitor({...newMonitor, priority: p})}
                        style={{ 
                          flex: 1, padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", border: "none", cursor: "pointer",
                          backgroundColor: newMonitor.priority === p ? COLORS.blue : COLORS.sidebar,
                          color: newMonitor.priority === p ? COLORS.bg : COLORS.dimText,
                          transition: "all 0.2s"
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: COLORS.dimText, marginBottom: "12px" }}>
                    ALERT THRESHOLD <span>{newMonitor.alertThreshold}%</span>
                  </label>
                  <input 
                    type="range" min="70" max="95" value={newMonitor.alertThreshold}
                    onChange={e => setNewMonitor({...newMonitor, alertThreshold: parseInt(e.target.value)})}
                    style={{ width: "100%", accentColor: COLORS.blue }}
                  />
                  <p style={{ fontSize: "11px", color: COLORS.dimText, marginTop: "8px" }}>
                    Set lower than zone threshold (90%) for early warning.
                  </p>
                </div>

                <div style={{ backgroundColor: "rgba(96, 165, 250, 0.05)", padding: "16px", borderRadius: "12px", border: `1px solid ${COLORS.blue}22` }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "12px", color: COLORS.blue, fontWeight: "bold" }}>PREVIEW</h4>
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: COLORS.dimText, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <li>Appear in the live dashboard for <strong>{newMonitor.zoneName}</strong></li>
                    <li>Have its own prediction chart in Predictions view</li>
                    <li>Alert at <strong>{newMonitor.alertThreshold}%</strong> utilization</li>
                    <li>Be tracked by <strong>{newMonitor.department}</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ padding: "24px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: "12px" }}>
              <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "14px", borderRadius: "8px", backgroundColor: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, fontWeight: "bold", cursor: "pointer" }}>Cancel</button>
              <button 
                onClick={handleAddMonitorSubmit}
                disabled={!newMonitor.name}
                style={{ flex: 2, padding: "14px", borderRadius: "8px", backgroundColor: COLORS.blue, color: COLORS.bg, border: "none", fontWeight: "bold", cursor: "pointer", opacity: !newMonitor.name ? 0.5 : 1 }}
              >
                Add Monitor →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CUSTOM MODAL */}
      {editingCustomId && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", backdropFilter: "blur(4px)" }}>
          <div style={{ backgroundColor: COLORS.card, borderRadius: "16px", border: `1px solid ${COLORS.border}`, width: "100%", maxWidth: "500px", padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>Edit Monitor</h3>
              <button onClick={() => setEditingCustomId(null)} style={{ background: "none", border: "none", color: COLORS.dimText, cursor: "pointer" }}><X size={24} /></button>
            </div>
            
            {(() => {
              const asset = customAssets.find(a => a.id === editingCustomId);
              if (!asset) return null;
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>MONITOR NAME</label>
                    <input 
                      type="text" defaultValue={asset.name}
                      onBlur={e => updateCustomAsset(asset.id, { name: e.target.value }, user.name)}
                      style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "12px", color: COLORS.text, fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>DESCRIPTION</label>
                    <textarea 
                      defaultValue={asset.description}
                      onBlur={e => updateCustomAsset(asset.id, { description: e.target.value }, user.name)}
                      style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "12px", color: COLORS.text, fontSize: "14px", height: "80px", resize: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "12px" }}>PRIORITY LEVEL</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {['Low', 'Medium', 'High', 'Critical Watch'].map(p => (
                        <button
                          key={p}
                          onClick={() => updateCustomAsset(asset.id, { priority: p }, user.name)}
                          style={{ 
                            flex: 1, padding: "10px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold", border: "none", cursor: "pointer",
                            backgroundColor: asset.priority === p ? COLORS.blue : COLORS.sidebar,
                            color: asset.priority === p ? COLORS.bg : COLORS.dimText
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setEditingCustomId(null)} style={{ width: "100%", padding: "14px", borderRadius: "8px", backgroundColor: COLORS.blue, color: COLORS.bg, border: "none", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>Done</button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}
