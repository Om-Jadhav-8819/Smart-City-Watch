import React, { useState, useEffect } from 'react';
import { Edit2, Plus, Trash2, Save, X, Info } from 'lucide-react';
import { COLORS, ZONE_NAMES, ASSET_META } from '../../data/cityConstants';
import SectionTitle from '../shared/SectionTitle';
import StatusBadge from '../shared/StatusBadge';

export default function ZoneManager({ zones, updateZone, user }: { zones: any[], updateZone: (id: number, updates: any) => void, user: any }) {
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customMonitors, setCustomMonitors] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [newMonitor, setNewMonitor] = useState({
    name: '',
    zoneId: 0,
    assetType: 'roads',
    description: ''
  });

  useEffect(() => {
    try {
      const monitors = JSON.parse(localStorage.getItem('cityvitals_monitors') || '[]');
      setCustomMonitors(monitors);
      const audit = JSON.parse(localStorage.getItem('cityvitals_audit') || '[]');
      setAuditLog(audit);
    } catch (e) {
      console.error("Failed to load local data", e);
    }
  }, []);

  const handleEdit = (zone: any) => {
    setSelectedZoneId(zone.id);
    setEditData({
      name: zone.name,
      population: zone.population,
      threshold: zone.threshold || 90,
      notes: zone.notes || "",
      priority: zone.priority || "Medium"
    });
  };

  const handleSave = () => {
    if (selectedZoneId === null) return;
    updateZone(selectedZoneId, editData);
    
    // Log audit
    const newEntry = {
      timestamp: new Date().toISOString(),
      userName: user.name,
      action: `Updated zone ${editData.name}: ${Object.keys(editData).join(', ')}`
    };
    const newAudit = [newEntry, ...auditLog].slice(0, 10);
    setAuditLog(newAudit);
    localStorage.setItem('cityvitals_audit', JSON.stringify(newAudit));
    
    setSelectedZoneId(null);
    setEditData(null);
  };

  const handleAddMonitor = () => {
    const monitor = {
      ...newMonitor,
      id: Date.now(),
      department: user.department,
      createdAt: new Date().toISOString()
    };
    const updated = [...customMonitors, monitor];
    setCustomMonitors(updated);
    localStorage.setItem('cityvitals_monitors', JSON.stringify(updated));
    
    const newEntry = {
      timestamp: new Date().toISOString(),
      userName: user.name,
      action: `Added custom monitor: ${monitor.name}`
    };
    const newAudit = [newEntry, ...auditLog].slice(0, 10);
    setAuditLog(newAudit);
    localStorage.setItem('cityvitals_audit', JSON.stringify(newAudit));
    
    setShowAddModal(false);
    setNewMonitor({ name: '', zoneId: 0, assetType: 'roads', description: '' });
  };

  const handleDeleteMonitor = (id: number) => {
    if (window.confirm("Remove this monitor? This cannot be undone.")) {
      const updated = customMonitors.filter(m => m.id !== id);
      setCustomMonitors(updated);
      localStorage.setItem('cityvitals_monitors', JSON.stringify(updated));
    }
  };

  const avgUtil = (assets: any) => (Object.values(assets) as number[]).reduce((a, b) => a + b, 0) / 4;

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>Zone & Asset Manager</h2>
          <p style={{ color: COLORS.dimText, fontSize: "14px", marginTop: "4px" }}>Configure thresholds, metadata, and custom monitoring points.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "8px", backgroundColor: COLORS.blue, color: COLORS.bg, border: "none", cursor: "pointer", fontWeight: "bold" }}
        >
          <Plus size={18} /> Add Asset Monitor
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedZoneId !== null ? "1fr 380px" : "1fr", gap: "24px", transition: "all 0.3s ease" }}>
        {/* LEFT: ZONE LIST */}
        <div style={{ backgroundColor: COLORS.card, borderRadius: "12px", border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: "rgba(255,255,255,0.02)" }}>
                <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>ZONE NAME</th>
                <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>POPULATION</th>
                <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>AVG UTIL</th>
                <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>ASSETS</th>
                <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>STATUS</th>
                <th style={{ padding: "16px 24px", color: COLORS.dimText, fontWeight: "normal" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(z => {
                const util = avgUtil(z.assets);
                return (
                  <tr key={z.id} style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: selectedZoneId === z.id ? "rgba(96, 165, 250, 0.05)" : "transparent" }}>
                    <td style={{ padding: "16px 24px", fontWeight: "bold" }}>{z.name}</td>
                    <td style={{ padding: "16px 24px" }}>{(z.population / 1000).toFixed(1)}k</td>
                    <td style={{ padding: "16px 24px", fontWeight: "bold", color: util >= 90 ? COLORS.red : util >= 75 ? COLORS.amber : COLORS.green }}>
                      {Math.round(util)}%
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {Object.entries(z.assets).map(([key, val]: [string, any]) => (
                          <div key={key} title={`${key}: ${Math.round(val)}%`} style={{ color: val >= 90 ? COLORS.red : val >= 75 ? COLORS.amber : COLORS.dimText }}>
                            {(ASSET_META as any)[key].icon}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}><StatusBadge utilization={util} /></td>
                    <td style={{ padding: "16px 24px" }}>
                      <button 
                        onClick={() => handleEdit(z)}
                        style={{ background: "none", border: "none", color: COLORS.blue, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "bold" }}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* RIGHT: EDIT PANEL */}
        {selectedZoneId !== null && (
          <div style={{ backgroundColor: COLORS.card, borderRadius: "12px", border: `1px solid ${COLORS.blue}44`, padding: "24px", height: "fit-content", position: "sticky", top: "0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>Edit Zone</h3>
              <button onClick={() => setSelectedZoneId(null)} style={{ background: "none", border: "none", color: COLORS.dimText, cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>DISPLAY NAME</label>
                <input 
                  type="text" 
                  value={editData.name}
                  onChange={e => setEditData({...editData, name: e.target.value})}
                  style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "10px", color: COLORS.text, fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>POPULATION</label>
                <input 
                  type="number" 
                  min="10000"
                  max="200000"
                  value={editData.population}
                  onChange={e => setEditData({...editData, population: parseInt(e.target.value)})}
                  style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "10px", color: COLORS.text, fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>
                  ALERT THRESHOLD OVERRIDE <span>{editData.threshold}%</span>
                </label>
                <input 
                  type="range" 
                  min="75"
                  max="95"
                  value={editData.threshold}
                  onChange={e => setEditData({...editData, threshold: parseInt(e.target.value)})}
                  style={{ width: "100%", accentColor: COLORS.blue }}
                />
                <div style={{ fontSize: "10px", color: COLORS.dimText, marginTop: "4px" }}>Alert me when utilization exceeds {editData.threshold}%</div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>PRIORITY LEVEL</label>
                <select 
                  value={editData.priority}
                  onChange={e => setEditData({...editData, priority: e.target.value})}
                  style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "10px", color: COLORS.text, fontSize: "14px" }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical Watch">Critical Watch</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>ZONE NOTES</label>
                <textarea 
                  value={editData.notes}
                  onChange={e => setEditData({...editData, notes: e.target.value})}
                  placeholder="Add context for other officials..."
                  style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "10px", color: COLORS.text, fontSize: "13px", height: "80px", resize: "none" }}
                />
              </div>

              <button 
                onClick={handleSave}
                style={{ width: "100%", backgroundColor: COLORS.blue, color: COLORS.bg, border: "none", borderRadius: "8px", padding: "14px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CUSTOM MONITORS SECTION */}
      <div style={{ marginTop: "40px" }}>
        <SectionTitle color={COLORS.purple}>Custom Asset Monitors</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {customMonitors.map((m: any) => (
            <div key={m.id} style={{ backgroundColor: COLORS.card, borderRadius: "12px", border: `1px solid ${COLORS.border}`, padding: "20px", position: "relative" }}>
              <button 
                onClick={() => handleDeleteMonitor(m.id)}
                style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", color: COLORS.dimText, cursor: "pointer" }}
              >
                <Trash2 size={14} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ color: COLORS.purple }}>{(ASSET_META as any)[m.assetType].icon}</div>
                <div style={{ fontWeight: "bold", fontSize: "15px" }}>{m.name}</div>
              </div>
              <div style={{ fontSize: "12px", color: COLORS.dimText, marginBottom: "12px" }}>{m.description}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", borderTop: `1px solid ${COLORS.border}`, paddingTop: "12px" }}>
                <span>Zone: {ZONE_NAMES[m.zoneId]}</span>
                <span style={{ color: COLORS.purple }}>{m.department}</span>
              </div>
            </div>
          ))}
          {customMonitors.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "12px", border: `1px dashed ${COLORS.border}`, color: COLORS.dimText }}>
              No custom monitors added yet.
            </div>
          )}
        </div>
      </div>

      {/* ADD MONITOR MODAL */}
      {showAddModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ backgroundColor: COLORS.card, borderRadius: "16px", border: `1px solid ${COLORS.border}`, width: "100%", maxWidth: "500px", padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>Add Asset Monitor</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: COLORS.dimText, cursor: "pointer" }}><X size={24} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>MONITOR NAME</label>
                <input 
                  type="text" 
                  placeholder="e.g. Core Junction Traffic"
                  value={newMonitor.name}
                  onChange={e => setNewMonitor({...newMonitor, name: e.target.value})}
                  style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "12px", color: COLORS.text, fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>ZONE</label>
                  <select 
                    value={newMonitor.zoneId}
                    onChange={e => setNewMonitor({...newMonitor, zoneId: parseInt(e.target.value)})}
                    style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "12px", color: COLORS.text, fontSize: "14px" }}
                  >
                    {ZONE_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>ASSET TYPE</label>
                  <select 
                    value={newMonitor.assetType}
                    onChange={e => setNewMonitor({...newMonitor, assetType: e.target.value})}
                    style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "12px", color: COLORS.text, fontSize: "14px" }}
                  >
                    {Object.keys(ASSET_META).map(key => <option key={key} value={key}>{(ASSET_META as any)[key].label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: COLORS.dimText, marginBottom: "8px" }}>DESCRIPTION</label>
                <textarea 
                  placeholder="What is this monitor tracking?"
                  value={newMonitor.description}
                  onChange={e => setNewMonitor({...newMonitor, description: e.target.value})}
                  style={{ width: "100%", backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "12px", color: COLORS.text, fontSize: "14px", height: "100px", resize: "none" }}
                />
              </div>

              <div style={{ backgroundColor: "rgba(96, 165, 250, 0.05)", padding: "12px", borderRadius: "8px", display: "flex", gap: "10px", alignItems: "center" }}>
                <Info size={16} color={COLORS.blue} />
                <span style={{ fontSize: "11px", color: COLORS.dimText }}>This monitor will be assigned to the <strong>{user.department}</strong>.</span>
              </div>

              <button 
                onClick={handleAddMonitor}
                disabled={!newMonitor.name}
                style={{ width: "100%", backgroundColor: COLORS.blue, color: COLORS.bg, border: "none", borderRadius: "8px", padding: "14px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", opacity: !newMonitor.name ? 0.5 : 1 }}
              >
                Save Monitor Point
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
