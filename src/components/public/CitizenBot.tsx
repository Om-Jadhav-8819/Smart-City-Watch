import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, MapPin, Phone, AlertCircle, Info } from 'lucide-react';
import { COLORS, EMERGENCY_CONTACTS } from '../../data/cityConstants';

async function callGemini(apiKey: string, systemPrompt: string, chatHistory: any[]) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: chatHistory.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    })),
    generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
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
    || "I'm sorry, I'm having trouble connecting to the city systems. Please try again in a moment.";
}

export default function CitizenBot({ zones, simHour, user, apiKey, setApiKey }: { zones: any[], simHour: number, user: any, apiKey: string, setApiKey: (k: string) => void }) {
  const [messages, setMessages] = useState<any[]>([
    { 
      role: "assistant", 
      content: `Hello ${user.name.split(' ')[0]}! I'm CityAssist, your AI guide to ${user.zone} and the rest of the city. How can I help you today?`, 
      time: new Date() 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const systemPrompt = useMemo(() => {
    const userZone = zones.find(z => z.name === user.zone) || zones[0];
    const cityStatus = zones.map(z => {
      const avg = Object.values(z.assets).reduce((a: any, b: any) => a + b, 0) as number / 4;
      return `${z.name}: ${Math.round(avg)}% load`;
    }).join(', ');

    const criticals = zones.filter(z => Object.values(z.assets).some((v: any) => v >= 90)).map(z => z.name);

    return `You are CityAssist, a friendly and helpful AI assistant for the citizens of CityVitals.
    
    USER INFO:
    Name: ${user.name}
    Home Zone: ${user.zone}
    Current Time: ${simHour}:00
    
    CITY STATUS:
    ${cityStatus}
    
    CRITICAL AREAS:
    ${criticals.length > 0 ? criticals.join(', ') : "None"}
    
    EMERGENCY CONTACTS:
    ${Object.entries(EMERGENCY_CONTACTS).map(([k, v]) => `${k}: ${v}`).join(', ')}
    
    YOUR GOALS:
    1. Provide clear, empathetic information about city infrastructure.
    2. If the user's home zone (${user.zone}) has high utilization (>75%), offer specific advice (e.g., conserve power, avoid certain roads).
    3. Always provide emergency numbers if the user sounds distressed or reports a dangerous situation.
    4. Keep responses concise and easy to read for a general citizen.
    
    TONE: Helpful, transparent, community-focused.
    
    If asked about technical details you don't have, refer them to the official City Portal or suggest they contact their local zone representative.`;
  }, [zones, simHour, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    if (!apiKey) {
      setError("Please provide a Gemini API Key to use CityAssist.");
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

  const quickReplies = [
    "Is my area safe?",
    "Why is traffic slow?",
    "Power saving tips",
    "Emergency contacts",
    "Report an issue"
  ];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 160px)", gap: "24px", animation: "fadeIn 0.5s ease-out" }}>
      {/* SIDEBAR */}
      <div style={{ width: "300px", display: window.innerWidth < 1024 ? "none" : "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ backgroundColor: COLORS.card, borderRadius: "20px", border: `1px solid ${COLORS.border}`, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: COLORS.blue, marginBottom: "16px" }}>
            <MapPin size={20} />
            <span style={{ fontWeight: "bold", fontSize: "14px" }}>Local Status</span>
          </div>
          <div style={{ fontSize: "13px", color: COLORS.dimText, lineHeight: "1.6" }}>
            You are currently viewing data for <strong>{user.zone}</strong>. CityAssist can help you interpret these numbers.
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.05)", borderRadius: "20px", border: `1px solid ${COLORS.red}33`, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: COLORS.red, marginBottom: "16px" }}>
            <AlertCircle size={20} />
            <span style={{ fontWeight: "bold", fontSize: "14px" }}>Safety First</span>
          </div>
          <div style={{ fontSize: "13px", color: COLORS.dimText, lineHeight: "1.6" }}>
            In case of immediate danger, always call <strong>911</strong> directly. AI assistance is for informational purposes only.
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: COLORS.card, borderRadius: "24px", border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255,255,255,0.01)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: COLORS.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🤖</div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "bold" }}>CityAssist AI</div>
              <div style={{ fontSize: "11px", color: COLORS.green, display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: COLORS.green }} /> Online
              </div>
            </div>
          </div>
          {!apiKey && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Info size={14} color={COLORS.dimText} />
              <input 
                type="password" 
                placeholder="Gemini API Key..." 
                onChange={(e) => setApiKey(e.target.value)}
                style={{ backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "20px", padding: "6px 16px", color: COLORS.text, fontSize: "11px", width: "160px" }}
              />
            </div>
          )}
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "assistant" ? "flex-start" : "flex-end" }}>
              <div style={{ 
                maxWidth: "80%", 
                padding: "14px 18px", 
                borderRadius: m.role === "assistant" ? "20px 20px 20px 4px" : "20px 20px 4px 20px",
                backgroundColor: m.role === "assistant" ? COLORS.sidebar : COLORS.blue,
                color: m.role === "assistant" ? COLORS.text : COLORS.bg,
                fontSize: "14px",
                lineHeight: "1.5",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: "8px", padding: "12px" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: "8px", height: "8px", backgroundColor: COLORS.dimText, borderRadius: "50%", animation: "pulse 1.5s infinite", animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          )}
          {error && <div style={{ color: COLORS.red, fontSize: "12px", textAlign: "center", padding: "12px", backgroundColor: `${COLORS.red}11`, borderRadius: "12px" }}>{error}</div>}
        </div>

        <div style={{ padding: "24px", borderTop: `1px solid ${COLORS.border}`, backgroundColor: "rgba(255,255,255,0.01)" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
            {quickReplies.map((s, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(s)}
                style={{ padding: "8px 16px", borderRadius: "20px", border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.card, color: COLORS.dimText, fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}
              >
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <input 
              type="text" 
              placeholder="Ask me anything about the city..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              style={{ flex: 1, backgroundColor: COLORS.sidebar, border: `1px solid ${COLORS.border}`, borderRadius: "24px", padding: "14px 24px", color: COLORS.text, fontSize: "14px", outline: "none" }}
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: COLORS.blue, border: "none", color: COLORS.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
