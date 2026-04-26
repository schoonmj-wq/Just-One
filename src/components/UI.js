import { useEffect, useState } from "react";

export function Toast({ message, type }) {
  if (!message) return null;
  const bg = type === "error" ? "#ef4444" : type === "success" ? "#22c55e" : "#1e1e2e";
  const border = type === "info" ? "1px solid #ffffff20" : "none";
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: bg, color: "#fff", border,
      padding: "11px 22px", borderRadius: 100,
      fontFamily: "'Karla', sans-serif", fontSize: 14, fontWeight: 600,
      zIndex: 999, animation: "fadeUp 0.25s ease", whiteSpace: "nowrap",
      boxShadow: "0 4px 20px #00000050",
    }}>
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "info", duration = 2500) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), duration);
  };
  return { toast, showToast };
}

export function Btn({ children, onClick, variant = "primary", disabled, style = {} }) {
  const base = {
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none", borderRadius: 10,
    fontFamily: "'Karla', sans-serif", fontWeight: 700,
    fontSize: 15, transition: "all 0.15s",
    opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary: { background: "#ff8906", color: "#0f0e17", padding: "12px 28px" },
    secondary: { background: "#ffffff12", color: "#fffffe", padding: "11px 22px", border: "1px solid #ffffff20" },
    danger: { background: "#ef444418", color: "#ef4444", padding: "9px 18px", border: "1px solid #ef444435", fontSize: 13 },
    ghost: { background: "transparent", color: "#ffffff60", padding: "9px 16px", fontSize: 13 },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

export function Input({ value, onChange, onEnter, placeholder, style = {}, autoFocus, disabled }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => e.key === "Enter" && onEnter?.()}
      placeholder={placeholder}
      autoFocus={autoFocus}
      disabled={disabled}
      style={{
        background: "#ffffff0d", border: "1px solid #ffffff22",
        borderRadius: 9, color: "#fffffe", padding: "11px 15px",
        fontFamily: "'Karla', sans-serif", fontSize: 15, outline: "none",
        transition: "border 0.2s", width: "100%",
        ...style
      }}
    />
  );
}

export function Card({ children, style = {}, glow }) {
  return (
    <div style={{
      background: "#16162a", border: `1px solid ${glow ? glow + "40" : "#ffffff14"}`,
      borderRadius: 16, padding: "20px 22px",
      boxShadow: glow ? `0 0 24px ${glow}18` : "none",
      ...style
    }}>
      {children}
    </div>
  );
}

export function Label({ children }) {
  return (
    <div style={{
      fontFamily: "'Karla', sans-serif", fontSize: 10, fontWeight: 700,
      letterSpacing: "0.2em", textTransform: "uppercase",
      color: "#ff890670", marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

export function CluePill({ word, color, playerName, eliminated }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        display: "inline-block",
        padding: "8px 20px", borderRadius: 100,
        fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700,
        letterSpacing: 1,
        background: eliminated ? "#ffffff08" : color + "22",
        color: eliminated ? "#ffffff30" : color,
        border: `2px solid ${eliminated ? "#ffffff12" : color + "55"}`,
        textDecoration: eliminated ? "line-through" : "none",
      }}>
        {word}
      </div>
      {playerName && (
        <div style={{ fontFamily: "'Karla', sans-serif", fontSize: 11, color: color + "70", marginTop: 4 }}>
          {playerName}
        </div>
      )}
    </div>
  );
}

export function PhaseLabel({ children }) {
  return (
    <div style={{
      fontFamily: "'Karla', sans-serif", fontSize: 10, letterSpacing: "0.2em",
      textTransform: "uppercase", color: "#ffffff45", marginBottom: 6,
    }}>
      {children}
    </div>
  );
}

export function PlayerDot({ color, name, size = 10 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: size, height: size, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
      <span style={{ fontFamily: "'Karla', sans-serif", color, fontWeight: 600, fontSize: 14 }}>{name}</span>
    </span>
  );
}
