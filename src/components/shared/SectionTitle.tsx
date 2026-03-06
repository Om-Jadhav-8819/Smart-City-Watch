import React from 'react';
import { COLORS } from '../../data/cityConstants';

export default function SectionTitle({ children, color = COLORS.dimText }: { children: React.ReactNode, color?: string }) {
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "12px", 
      marginBottom: "20px",
      marginTop: "10px"
    }}>
      <div style={{ 
        width: "14px", 
        height: "1px", 
        backgroundColor: color 
      }} />
      <div style={{ 
        fontSize: "10px", 
        fontWeight: "bold", 
        letterSpacing: "2.5px", 
        color: color, 
        textTransform: "uppercase" 
      }}>
        {children}
      </div>
    </div>
  );
}
