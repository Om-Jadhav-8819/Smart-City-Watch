import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { COLORS } from '../../data/cityConstants';
import { useAuth } from '../../context/AuthContext';

export default function SignInForm({ role, onBack, onSwitchToSignUp }: { role: string, onBack: () => void, onSwitchToSignUp: () => void }) {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const accentColor = role === 'admin' ? COLORS.blue : COLORS.green;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = signIn(formData.email, formData.password, role);
    
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: COLORS.sidebar,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "12px 12px 12px 40px",
    color: COLORS.text,
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s"
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: COLORS.dimText
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "20px" }}>
      <div style={{ backgroundColor: COLORS.card, padding: "40px", borderRadius: "16px", border: `1px solid ${COLORS.border}`, width: "100%", maxWidth: "400px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: COLORS.dimText, cursor: "pointer", fontSize: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "4px" }}>
          ← Back to selection
        </button>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: COLORS.text }}>Welcome Back</h2>
          <div style={{ display: "inline-block", marginTop: "8px", padding: "4px 12px", borderRadius: "20px", backgroundColor: `${accentColor}22`, color: accentColor, fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }}>
            {role === 'admin' ? 'Official Access' : 'Citizen Access'}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ position: "relative" }}>
            <Mail size={18} style={iconStyle} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              style={inputStyle}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div style={{ position: "relative" }}>
            <Lock size={18} style={iconStyle} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              required
              style={inputStyle}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: COLORS.dimText, cursor: "pointer" }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <div style={{ color: COLORS.red, fontSize: "12px", textAlign: "center" }}>{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              backgroundColor: accentColor, 
              color: COLORS.bg, 
              border: "none", 
              borderRadius: "8px", 
              padding: "14px", 
              fontWeight: "bold", 
              cursor: "pointer",
              marginTop: "10px",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: COLORS.dimText }}>
          Don't have an account?{' '}
          <button 
            onClick={onSwitchToSignUp}
            style={{ background: "none", border: "none", color: accentColor, cursor: "pointer", fontWeight: "bold" }}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}
