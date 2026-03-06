import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, TrendingUp, TrendingDown, Minus, Copy, Check, Activity } from 'lucide-react';
import { COLORS } from '../../data/cityConstants';

async function callGemini(apiKey: string, systemPrompt: string, chatHistory: any[]) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: chatHistory.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    })),
    generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API Error ${res.status}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text 
    || "I encountered an error processing your request. Please try again.";
}

export default function AdminBot({ zones, simHour, history, user, apiKey, setApiKey }: { zones: any[], simHour: number, history: any, user: any, apiKey: string, setApiKey: (k: string) => void }) {
  const [messages, setMessages] = useState<any[]>([
    { 
      role: "assistant", 
      content: `📊 SITUATION: System online. Monitoring 9 zones for ${user.department}.\n🔍 ANALYSIS: I have analyzed the current city vitals. Overall health is stable, but I've identified 2 areas for potential optimization.\n⚡ RECOMMENDATION: Review the 'Predictions' tab for the City Core power grid. I'm standing by for executive queries.`, 
      time: new Date() 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const systemPrompt = useMemo(() => {
    const zoneStatus = zones.map(z => {
      const assets = Object.entries(z.assets).map(([k, v]: [string, any]) => `${k}: ${Math.round(v)}%`).join(', ');
      return `${z.name} (${z.type}): ${assets}`;
    }).join('\n');

    const trends: string[] = [];
    zones.forEach(z => {
      Object.keys(z.assets).forEach(a => {
        const h = history[z.id]?.[a] || [];
        if (h.length >= 10) {
          const recent = h.slice(-10);
          const avg = recent.reduce((sum: number, v: number) => sum + v, 0) / 10;
          if (avg > 80) trends.push(`${z.name} ${a} is trending high (avg ${Math.round(avg)}%)`);
        }
      });
    });

    const alerts: string[] = [];
    zones.forEach(z => {
      Object.entries(z.assets).forEach(([k, v]: [string, any]) => {
        if (v >= 90) alerts.push(`CRITICAL: ${z.name} ${k} at ${Math.round(v)}% (Impact: ${Math.round(z.population/1000)}k pop)`);
        else if (v >= 75) alerts.push(`WARNING: ${z.name} ${k} at ${Math.round(v)}%`);
      });
    });

    return `You are CityCommand, an AI assistant for city government officials using the CityVitals infrastructure management platform.
   
   You are talking to: ${user.name}, ${user.department} department.
   
   YOUR ROLE: Help officials make fast, data-driven infrastructure decisions.
   You have access to live city data, breach predictions, and historical trends.
   
   LIVE CITY DATA:
   ${zoneStatus}
   
   TRENDING ANALYSIS:
   ${trends.length > 0 ? trends.join('\n') : "No significant high-utilization trends detected."}
   
   CURRENT ALERTS:
   ${alerts.length > 0 ? alerts.join('\n') : "All systems normal."}
   
   RESPONSE FORMAT — always structure like this:
   📊 SITUATION: [1 sentence on what's happening]
   🔍 ANALYSIS: [2-3 sentences of data-driven insight]  
   ⚡ RECOMMENDATION: [2-3 specific actions to take]
   📞 ESCALATE TO: [relevant department if needed]
   
   OFFICIAL-LEVEL CAPABILITIES:
   - Analyze trends across multiple zones simultaneously
   - Identify cascade risk before it happens
   - Recommend resource pre-positioning
   - Draft inter-department coordination advisories
   - Estimate population impact of infrastructure decisions
   
   TONE: Executive briefing style. Data-first. No fluff.
   Always cite specific zone names and utilization numbers.`;
  }, [zones, history, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    if (!apiKey) {
      setError("Gemini API Key required for CityCommand AI.");
      return;
    }
    
    setError(null);
    setInput("");
    const userMsg = { role: "user", content: trimmed, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await callGemini(apiKey, systemPrompt, [...messages, userMsg]);
      setMessages(prev => [...prev, { role: "assistant", content: reply, time: new Date() }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToReport = (text: string, id: number) => {
    const reportText = `CITYVITALS EXECUTIVE REPORT\nGenerated by: ${user.name} (${user.department})\nTimestamp: ${new Date().toLocaleString()}\n\n${text}`;
    navigator.clipboard.writeText(reportText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestions = [
    "What are today's top 3 risks?",
    "Which zones need intervention?",
    "Draft a public advisory",
    "Recommend resource pre-positioning"
  ];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 120px)", gap: "24px", animation: "fadeIn 0.5s ease-out" }}>
      {/* SIDEBAR */}
      <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ backgroundColor: COLORS.card, borderRadius: "12px", border: `1px solid ${COLORS.border}`, padding: "16px" }}>
          <div style={{ fontSize: "10px", color: COLORS.dimText, letterSpacing: "1px", fontWeight: "bold", marginBottom: "12px" }}>TRENDING INDICATORS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {zones.map(z => {
              const h = history[z.id]?.roads || [];
              const recent = h.slice(-10);
              const prev = h.slice(-20, -10);
              const rAvg = recent.reduce((a: number,b: number)=>a+b,0)/10 || 0;
              const pAvg = prev.reduce((a: number,b: number)=>a+b,0)/10 || 0;
              const diff = rAvg - pAvg;
              
              return (
                <div key={z.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: COLORS.text }}>{z.name}</span>
                  {diff > 5 ? <TrendingUp size={14} color={COLORS.red} /> : 
                   diff < -5 ? <TrendingDown size={14} color={COLORS.green} /> : 
                   <Minus size={14} color={COLORS.dimText} />}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(167, 139, 250, 0.05)", borderRadius: "12px", border: `1px solid ${COLORS.purple}33`, padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: COLORS.purple, marginBottom: "8px" }}>
            <Activity size={16} />
            <span style={{ fontSize: "12px", fontWeight: "bold" }}>OFFICIAL USE ONLY</span>
          </div>
          <p style={{ fontSize: "11px", color: COLORS.dimText, margin: 0, lineHeight: "1.5" }}>
            All AI recommendations should be verified against live telemetry before deployment.
          </p>
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: COLORS.card, borderRadius: "16px", border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>📊</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>CityCommand AI</div>
              <div style={{ fontSize: "10px", color: COLORS.dimText }}>Strategic Decision Support</div>
            </div>
          </div>
          {!apiKey && (
            <input 
              type="password" 
              placeholder="Enter Gemini API Key..." 
              onChange={(e) => setApiKey(e.target.value)}
              style={{ backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "4px", padding: "6px 12px", color: COLORS.text, fontSize: "11px", width: "180px" }}
            />
          )}
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "assistant" ? "flex-start" : "flex-end" }}>
              <div style={{ display: "flex", gap: "12px", maxWidth: "85%", flexDirection: m.role === "assistant" ? "row" : "row-reverse" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: COLORS.sidebar, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                  {m.role === "assistant" ? "📊" : "👤"}
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ 
                    padding: "16px", 
                    borderRadius: "12px", 
                    backgroundColor: m.role === "assistant" ? COLORS.sidebar : "rgba(96, 165, 250, 0.1)",
                    border: `1px solid ${m.role === "assistant" ? COLORS.border : "rgba(96, 165, 250, 0.2)"}`,
                    color: COLORS.text,
                    fontSize: "14px",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap"
                  }}>
                    {m.role === "assistant" ? m.content.split('\n').map((line: string, idx: number) => {
                      let bgColor = "transparent";
                      if (line.startsWith('📊')) bgColor = "rgba(96, 165, 250, 0.05)";
                      if (line.startsWith('🔍')) bgColor = "rgba(167, 139, 250, 0.05)";
                      if (line.startsWith('⚡')) bgColor = "rgba(16, 185, 129, 0.05)";
                      
                      return (
                        <div key={idx} style={{ backgroundColor: bgColor, padding: bgColor !== "transparent" ? "8px 12px" : "0", borderRadius: "6px", marginBottom: "4px" }}>
                          {line}
                        </div>
                      );
                    }) : m.content}
                  </div>
                  {m.role === "assistant" && (
                    <button 
                      onClick={() => copyToReport(m.content, i)}
                      style={{ position: "absolute", top: "10px", right: "-40px", background: "none", border: "none", color: COLORS.dimText, cursor: "pointer" }}
                      title="Copy as Report"
                    >
                      {copiedId === i ? <Check size={16} color={COLORS.green} /> : <Copy size={16} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: COLORS.sidebar, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>📊</div>
              <div style={{ display: "flex", gap: "4px" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: "6px", height: "6px", backgroundColor: COLORS.dimText, borderRadius: "50%" }} />
                ))}
              </div>
            </div>
          )}
          {error && <div style={{ color: COLORS.red, fontSize: "12px", textAlign: "center", padding: "10px", backgroundColor: `${COLORS.red}11`, borderRadius: "8px" }}>{error}</div>}
        </div>

        <div style={{ padding: "20px", borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(s)}
                style={{ padding: "6px 12px", borderRadius: "20px", border: `1px solid ${COLORS.border}`, backgroundColor: "transparent", color: COLORS.dimText, fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <input 
              type="text" 
              placeholder="Query strategic insights..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              style={{ flex: 1, backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "12px 16px", color: COLORS.text, fontSize: "14px" }}
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{ width: "44px", height: "44px", borderRadius: "8px", backgroundColor: COLORS.blue, border: "none", color: COLORS.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
