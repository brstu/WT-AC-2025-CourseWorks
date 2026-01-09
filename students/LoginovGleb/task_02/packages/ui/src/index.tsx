import React from "react";

export type PlaceholderCardProps = {
  title?: string;
  description?: string;
};

export const PlaceholderCard: React.FC<PlaceholderCardProps> = ({
  title = "UI package",
  description = "Drop shared UI primitives here",
}) => {
  return (
    <div
      style={{
        padding: "1rem",
        borderRadius: "12px",
        border: "1px dashed #cbd5e1",
        background: "#f8fafc",
      }}
    >
      <strong>{title}</strong>
      <p style={{ margin: "0.35rem 0 0", color: "#475569" }}>{description}</p>
    </div>
  );
};


