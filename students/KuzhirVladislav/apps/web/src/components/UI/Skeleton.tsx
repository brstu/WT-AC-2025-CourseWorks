import React from "react";

export default function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="item"
          style={{ padding: 12, display: "flex", gap: 12, alignItems: "center" }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
            }}
            className="skeleton"
          />
          <div style={{ flex: 1 }}>
            <div
              className="skeleton"
              style={{ height: 14, width: "60%", borderRadius: 6, marginBottom: 8 }}
            />
            <div className="skeleton" style={{ height: 12, width: "40%", borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
