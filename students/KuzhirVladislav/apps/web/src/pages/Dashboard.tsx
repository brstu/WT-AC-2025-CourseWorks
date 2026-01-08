import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Client, Deal, Task, Invoice } from "../types/models";
import { useAuth } from "../contexts/AuthContext";
import clientsApi from "../api/clients";
import dealsApi from "../api/deals";
import tasksApi from "../api/tasks";
import invoicesApi from "../api/invoices";

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    clients: 0,
    deals: 0,
    tasks: 0,
    invoices: 0,
    dealsAmount: 0,
    completedTasks: 0,
    paidInvoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentDeals, setRecentDeals] = useState<Deal[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([clientsApi.list(), dealsApi.list(), tasksApi.list(), invoicesApi.list()])
      .then(([clientsData, dealsData, tasksData, invoicesData]) => {
        const now = new Date();

        setStats({
          clients: clientsData.length,
          deals: dealsData.length,
          tasks: tasksData.length,
          invoices: invoicesData.length,
          dealsAmount: dealsData.reduce((sum, d) => sum + Number(d.amount || 0), 0),
          completedTasks: tasksData.filter((t) => t.completed).length,
          paidInvoices: invoicesData
            .filter((i) => i.status === "paid")
            .reduce((sum, i) => sum + (i.amount || 0), 0),
        });

        setRecentDeals([...dealsData].reverse().slice(0, 5));

        const overdue = tasksData.filter(
          (t) => t.dueDate && new Date(t.dueDate) < now && !t.completed
        );
        setOverdueTasks(overdue.slice(0, 5));

        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard data loading error:", err);
        setLoading(false);
      });
  }, []);

  const StatCard = ({ label, value, icon, color }: any) => (
    <div className="card" style={{ textAlign: "center", padding: "20px" }}>
      <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: 700, color }}>{value}</div>
    </div>
  );

  return (
    <div>
      <h1>Дашборд</h1>
      <p style={{ color: "var(--muted)", marginBottom: "24px" }}>Краткая сводка по вашему CRM</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <StatCard label="Клиенты" value={stats.clients} icon="👥" color="var(--accent)" />
        <StatCard label="Сделки" value={stats.deals} icon="💼" color="var(--accent-3)" />
        <StatCard label="Задачи" value={stats.tasks} icon="✓" color="var(--text)" />
        <StatCard label="Счета" value={stats.invoices} icon="📄" color="var(--muted)" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>
            Сумма сделок
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--accent-3)" }}>
            {stats.dealsAmount.toLocaleString("ru-RU")} ₽
          </div>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>
            Оплачено по счетам
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--accent-3)" }}>
            {stats.paidInvoices.toLocaleString("ru-RU")} ₽
          </div>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>
            Выполнено задач
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--text)" }}>
            {stats.completedTasks} / {stats.tasks}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "24px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3>Последние сделки</h3>
            <Link
              to="/deals"
              style={{ color: "var(--accent)", textDecoration: "none", fontSize: "12px" }}
            >
              Все →
            </Link>
          </div>
          {loading ? (
            <div className="card">Загрузка...</div>
          ) : recentDeals.length === 0 ? (
            <div className="card">Нет сделок</div>
          ) : (
            <div className="list" style={{ gap: "8px" }}>
              {recentDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="item"
                  style={{
                    display: "block",
                    padding: "12px",
                    borderLeft: "3px solid var(--accent)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "6px",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)" }}>
                      {deal.title}
                    </div>
                    <div style={{ fontWeight: 700, color: "var(--accent-3)", fontSize: "13px" }}>
                      {deal.amount?.toLocaleString("ru-RU") || "0"} ₽
                    </div>
                  </div>
                  {deal.clientId && (
                    <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                      👤 ID Клиента: {deal.clientId}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--muted)",
                      display: "flex",
                      gap: "12px",
                    }}
                  >
                    <span>
                      📅{" "}
                      {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString("ru-RU") : "—"}
                    </span>
                    {deal.stageId && <span>📍 Этап ID: {deal.stageId}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3>⚠️ Просроченные задачи</h3>
            <Link
              to="/tasks"
              style={{ color: "var(--accent)", textDecoration: "none", fontSize: "12px" }}
            >
              Все →
            </Link>
          </div>
          {loading ? (
            <div className="card">Загрузка...</div>
          ) : overdueTasks.length === 0 ? (
            <div className="card" style={{ color: "var(--accent-3)" }}>
              Просроченных задач нет ✓
            </div>
          ) : (
            <div className="list" style={{ gap: "8px" }}>
              {overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="item"
                  style={{
                    display: "block",
                    padding: "12px",
                    borderLeft: "3px solid var(--accent-3)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      marginBottom: "4px",
                      color: "var(--text)",
                    }}
                  >
                    {task.title}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--accent-3)",
                      marginBottom: "4px",
                      fontWeight: 600,
                    }}
                  >
                    ⏰ До {new Date(task.dueDate).toLocaleDateString("ru-RU")}
                  </div>
                  {task.dealId && (
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                      📋 ID Сделки: {task.dealId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {token && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "var(--soft)",
            borderRadius: "12px",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "12px" }}>⚡ Быстрые действия</h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Link to="/clients/new">
              <button className="button">+ Клиент</button>
            </Link>
            <Link to="/deals/new">
              <button className="button">+ Сделка</button>
            </Link>
            <Link to="/tasks/new">
              <button className="button">+ Задача</button>
            </Link>
            <Link to="/invoices/new">
              <button className="button">+ Счет</button>
            </Link>
            <Link to="/stages">
              <button className="button secondary">⚙️ Этапы</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
