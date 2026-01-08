import React from "react";
import { Link } from "react-router-dom";
import DealsPipeline from "../../components/DealsPipeline";

export default function DealsList() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1>Сделки — Воронка</h1>
        </div>
        <Link to="/deals/new">
          <button className="button">Создать сделку</button>
        </Link>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
        Управляйте сделками по этапам продаж
      </p>
      <DealsPipeline />
    </div>
  );
}
