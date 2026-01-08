import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Invoice, Deal } from "../types/models";
import invoicesApi from "../api/invoices";
import dealsApi from "../api/deals";
import { IconTrash, IconCheck } from "./Icons";
import CustomSelect from "./UI/CustomSelect";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import "../styles/modal.css";

interface InvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (invoice: Invoice) => void;
  onDelete?: () => void;
}

export default function InvoiceModal({
  invoice,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: InvoiceModalProps) {
  const [formData, setFormData] = useState<Partial<Invoice>>(invoice || {});
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [relatedItems, setRelatedItems] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFormData(invoice || { issueDate: new Date().toISOString() });
      setIsEditing(false);
      setError(null);
      loadData();
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen, invoice]);

  const loadData = async () => {
    try {
      const dealsData = await dealsApi.list();
      setDeals(dealsData);

      if (invoice?.id) {
        try {
          const counts = await invoicesApi.countRelated(String(invoice.id));
          setRelatedItems(counts.items);
        } catch (err) {
          console.error("Failed to load related counts:", err);
          // Продолжаем работу даже если не удалось загрузить подсчеты
        }
      }
    } catch (err: any) {
      console.error("Failed to load data:", err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    // Валидация на фронтенде
    if (!formData.amount || formData.amount <= 0) {
      setError("Укажите сумму больше нуля");
      return;
    }

    if (!formData.issueDate) {
      setError("Необходимо указать дату выставления счета");
      return;
    }

    setLoading(true);
    try {
      // Подготавливаем данные: если мы редактируем, нужен ID, если создаем — нет
      // Важно: issueDate должен быть в формате ISO (строка)
      const dataToSave = {
        ...formData,
        // Если дата пришла из input type="date", она в формате YYYY-MM-DD.
        // Дополняем её временем, чтобы бэкенд (LocalDateTime) не ругался.
        issueDate: formData.issueDate.includes("T")
          ? formData.issueDate
          : `${formData.issueDate}T00:00:00`,
      };

      let result: Invoice;
      if (invoice?.id) {
        result = await invoicesApi.update(String(invoice.id), dataToSave as Partial<Invoice>);
      } else {
        throw new Error("Метод создания не реализован в данном примере");
      }

      setIsEditing(false);
      onSave?.(result);
      onClose();
    } catch (err: any) {
      // Выводим ошибку от бэкенда (ту самую Validation failed)
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await invoicesApi.remove(String(invoice!.id));
      setShowConfirmDelete(false);
      onDelete?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      setShowConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const dealInfo =
    formData.deal?.title || deals.find((d) => d.id === formData.dealId)?.title || "Не указана";

  const modal = ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? "Редактирование счета" : "Детали счета"}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && (
          <div className="modal-error" style={{ color: "red", marginBottom: "10px" }}>
            {error}
          </div>
        )}

        <div className="modal-body">
          {isEditing ? (
            <form className="form">
              <div className="form-group">
                <label>Номер счета</label>
                <input
                  type="text"
                  value={formData.number || ""}
                  readOnly
                  style={{ backgroundColor: "rgba(255,255,255,0.02)", cursor: "default" }}
                />
              </div>

              <div className="form-group">
                <label>Дата выставления *</label>
                <input
                  type="date"
                  required
                  // Преобразуем 2026-01-07T14:27... в 2026-01-07 для input
                  value={formData.issueDate ? formData.issueDate.split("T")[0] : ""}
                  onChange={(e) => handleChange("issueDate", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Сделка *</label>
                <CustomSelect
                  value={formData.dealId ? String(formData.dealId) : ""}
                  onChange={(value) => handleChange("dealId", value ? Number(value) : null)}
                  options={[
                    { value: "", label: "Выберите сделку" },
                    ...deals.map((deal) => ({
                      value: String(deal.id),
                      label: deal.title,
                    })),
                  ]}
                  placeholder="Выберите сделку"
                />
              </div>
              <div className="form-group">
                <label>Сумма ($) *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.amount || ""}
                  onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Статус</label>
                <CustomSelect
                  value={formData.status || "draft"}
                  onChange={(value) => handleChange("status", value)}
                  options={[
                    { value: "draft", label: "Черновик" },
                    { value: "sent", label: "Отправлен" },
                    { value: "paid", label: "Оплачен" },
                  ]}
                  placeholder="Выберите статус"
                />
              </div>
            </form>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>Номер счета</label>
                <div className="info-value">{formData.number}</div>
              </div>

              <div className="info-item">
                <label>Дата выставления</label>
                <div className="info-value">
                  {formData.issueDate
                    ? new Date(formData.issueDate).toLocaleDateString("ru-RU")
                    : "—"}
                </div>
              </div>

              <div className="info-item">
                <label>Сделка</label>
                <div className="info-value">{dealInfo}</div>
              </div>

              <div className="info-item">
                <label>Сумма</label>
                <div className="info-value" style={{ color: "var(--accent-3)" }}>
                  ${formData.amount?.toLocaleString()}
                </div>
              </div>

              <div className="info-item">
                <label>Статус</label>
                <div className="info-value">
                  {formData.status === "draft" && "📝 Черновик"}
                  {formData.status === "sent" && "📤 Отправлен"}
                  {formData.status === "paid" && "✅ Оплачен"}
                </div>
              </div>

              {formData.deal && (
                <>
                  <div className="info-item">
                    <label>Сумма сделки</label>
                    <div className="info-value" style={{ color: "var(--accent)" }}>
                      ${formData.deal.amount?.toLocaleString()} ₽
                    </div>
                  </div>

                  <div className="info-item">
                    <label>Остаток к оплате</label>
                    <div
                      className="info-value"
                      style={{
                        color:
                          (formData.deal.amount || 0) - (formData.amount || 0) > 0
                            ? "var(--warning)"
                            : "var(--accent-3)",
                      }}
                    >
                      ${((formData.deal.amount || 0) - (formData.amount || 0)).toLocaleString()} ₽
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {isEditing ? (
            <>
              <button
                className="button button-secondary"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Отмена
              </button>
              <button className="button button-primary" onClick={handleSave} disabled={loading}>
                <IconCheck /> Сохранить
              </button>
            </>
          ) : (
            <>
              <button className="button button-danger" onClick={handleDelete} disabled={loading}>
                <IconTrash /> Удалить
              </button>
              <button className="button button-primary" onClick={() => setIsEditing(true)}>
                ✎ Редактировать
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {modal}
      <ConfirmDeleteModal
        isOpen={showConfirmDelete}
        title="Удалить счет?"
        message="При удалении счета связанные данные останутся в системе. Это действие невозможно отменить."
        relatedItems={[{ label: "Позиции", count: relatedItems }]}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        isLoading={loading}
        isDangerous={true}
      />
    </>
  );
}
