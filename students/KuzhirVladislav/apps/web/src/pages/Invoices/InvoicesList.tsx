import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Invoice } from "../../types/models";
import invoicesApi from "../../api/invoices";
import InvoiceModal from "../../components/InvoiceModal";
import Skeleton from "../../components/UI/Skeleton";

const STATUS_COLORS = {
  draft: "#9fb0c8",
  sent: "#15545e",
  paid: "#ffb020",
};

const STATUS_LABELS = {
  draft: "Черновик",
  sent: "Отправлен",
  paid: "Оплачен",
};

export default function InvoicesList() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const q = params.get("search") || "";

  useEffect(() => {
    loadInvoices();
  }, [q]);

  const loadInvoices = () => {
    setLoading(true);
    invoicesApi
      .list(q ? { search: q } : undefined)
      .then((r) => {
        setItems(r);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const getTotalAmount = () => {
    return items.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  };

  const getTotalByStatus = (status: string) => {
    return items
      .filter((inv) => inv.status === status)
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleModalSave = (updatedInvoice: Invoice) => {
    setItems(items.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)));
  };

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
          <h1>Счета</h1>
        </div>
        <Link to="/invoices/new">
          <button className="button">Создать счет</button>
        </Link>
      </div>

      {!loading && items.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Всего</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text)" }}>
              ${getTotalAmount().toLocaleString()}
            </div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Оплачено</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--accent-3)" }}>
              ${getTotalByStatus("paid").toLocaleString()}
            </div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Отправлено</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--accent)" }}>
              ${getTotalByStatus("sent").toLocaleString()}
            </div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Черновики</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--muted)" }}>
              ${getTotalByStatus("draft").toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card">
          <Skeleton rows={5} />
        </div>
      ) : (
        <div className="list">
          {items.length === 0 && <div className="card">Список пуст</div>}
          {items.map((inv) => (
            <div
              key={inv.id}
              className="item"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto",
                gap: "16px",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>Счет #{inv.number}</div>
                {inv.client && (
                  <div style={{ color: "var(--muted)", fontSize: "13px" }}>{inv.client.name}</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>Счет</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  ${inv.amount.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>Сумма сделки</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  ${(inv.deal?.amount || 0).toLocaleString()} ₽
                </div>
                {inv.deal && (
                  <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                    Остаток: ${((inv.deal?.amount || 0) - inv.amount).toLocaleString()} ₽
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    backgroundColor: STATUS_COLORS[inv.status || "draft"] + "20",
                    color: STATUS_COLORS[inv.status || "draft"],
                  }}
                >
                  {STATUS_LABELS[inv.status || "draft"]}
                </span>
                <button className="button" onClick={() => handleInvoiceClick(inv)}>
                  Открыть
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <InvoiceModal
        invoice={selectedInvoice}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        onDelete={loadInvoices}
      />
    </div>
  );
}
