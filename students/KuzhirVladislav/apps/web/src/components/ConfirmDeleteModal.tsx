import React from "react";
import ReactDOM from "react-dom";
import "../styles/modal.css";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  relatedItems?: {
    label: string;
    count: number;
  }[];
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  isDangerous?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  relatedItems,
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = true,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "500px" }}
      >
        <div className="modal-header">
          <h2 style={{ color: isDangerous ? "#ff6b6b" : "var(--text)" }}>{title}</h2>
          <button className="modal-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div style={{ marginBottom: "16px", lineHeight: "1.5" }}>{message}</div>

          {relatedItems && relatedItems.length > 0 && (
            <div
              style={{
                backgroundColor: "rgba(255, 107, 107, 0.1)",
                border: "1px solid rgba(255, 107, 107, 0.3)",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "16px",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "8px", color: "#ff6b6b" }}>
                ⚠️ Это приведет к удалению следующих элементов:
              </div>
              <ul
                style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "var(--muted)" }}
              >
                {relatedItems.map((item, idx) => (
                  <li key={idx}>
                    {item.label}: <strong>{item.count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ color: "var(--muted)", fontSize: "13px", fontStyle: "italic" }}>
            Это действие невозможно отменить.
          </div>
        </div>

        <div className="modal-footer">
          <button className="button button-secondary" onClick={onCancel} disabled={isLoading}>
            Отмена
          </button>
          <button
            className="button button-danger"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              backgroundColor: isDangerous ? "#ff6b6b" : "var(--danger)",
              borderColor: isDangerous ? "#ff6b6b" : "var(--danger)",
            }}
          >
            {isLoading ? "Удаляю..." : "Да, удалить"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
