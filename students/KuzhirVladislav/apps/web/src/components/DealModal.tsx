import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Deal, Client, Stage } from "../types/models";
import dealsApi from "../api/deals";
import clientsApi from "../api/clients";
import stagesApi from "../api/stages";
import { IconTrash, IconCheck } from "./Icons";
import CustomSelect from "./UI/CustomSelect";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import "../styles/modal.css";

interface DealModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (deal: Deal) => void;
  onDelete?: () => void;
}

export default function DealModal({ deal, isOpen, onClose, onSave, onDelete }: DealModalProps) {
  const [formData, setFormData] = useState<Partial<Deal>>(deal || {});
  const [clients, setClients] = useState<Client[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [relatedCounts, setRelatedCounts] = useState({ tasks: 0, invoices: 0 });

  useEffect(() => {
    if (isOpen) {
      setFormData(deal || {});
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
  }, [isOpen, deal]);

  const loadData = async () => {
    try {
      const [clientsData, stagesData] = await Promise.all([clientsApi.list(), stagesApi.list()]);
      setClients(clientsData);
      setStages(stagesData);

      if (deal?.id) {
        try {
          const counts = await dealsApi.countRelated(String(deal.id));
          setRelatedCounts(counts);
        } catch (err) {
          console.error("Failed to load related counts:", err);
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
    if (!formData.title || !formData.stageId) {
      setError("Заполните все обязательные поля");
      return;
    }

    setLoading(true);
    try {
      const updatedDeal = await dealsApi.update(String(deal!.id), formData as Partial<Deal>);
      setIsEditing(false);
      onSave?.(updatedDeal);
      onClose();
    } catch (err: any) {
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
      await dealsApi.remove(String(deal!.id));
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

  const clientName =
    formData.client?.name || clients.find((c) => c.id === formData.clientId)?.name || "Не указан";
  const stageName =
    formData.stage?.name || stages.find((s) => s.id === formData.stageId)?.name || "Не указан";

  const modal = ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? "Редактирование сделки" : "Детали сделки"}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-body">
          {isEditing ? (
            <form className="form">
              <div className="form-group">
                <label>Название *</label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Клиент</label>
                <CustomSelect
                  value={formData.clientId ? String(formData.clientId) : ""}
                  onChange={(value) => handleChange("clientId", value ? Number(value) : null)}
                  options={[
                    { value: "", label: "Выберите клиента" },
                    ...clients.map((client) => ({
                      value: String(client.id),
                      label: client.name,
                    })),
                  ]}
                  placeholder="Выберите клиента"
                />{" "}
              </div>

              <div className="form-group">
                <label>Этап *</label>
                <CustomSelect
                  value={formData.stageId ? String(formData.stageId) : ""}
                  onChange={(value) => handleChange("stageId", value ? Number(value) : null)}
                  options={[
                    { value: "", label: "Выберите этап" },
                    ...stages.map((stage) => ({
                      value: String(stage.id),
                      label: stage.name,
                    })),
                  ]}
                  placeholder="Выберите этап"
                  required
                />{" "}
              </div>

              <div className="form-group">
                <label>Сумма сделки</label>
                <input
                  type="number"
                  aria-value={formData.amount || ""}
                  onChange={(e) =>
                    handleChange("amount", e.target.value ? parseFloat(e.target.value) : null)
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                />
              </div>
            </form>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>Название</label>
                <div className="info-value">{formData.title}</div>
              </div>

              <div className="info-item">
                <label>Клиент</label>
                <div className="info-value">{clientName}</div>
              </div>

              <div className="info-item">
                <label>Этап</label>
                <div className="info-value">{stageName}</div>
              </div>

              <div className="info-item">
                <label>Сумма сделки</label>
                <div className="info-value">
                  {formData.amount ? `$${formData.amount.toLocaleString()}` : "Не указана"}
                </div>
              </div>

              <div className="info-item full">
                <label>Описание</label>
                <div className="info-value">{formData.description || "Не указано"}</div>
              </div>

              {formData.createdAt && (
                <div className="info-item">
                  <label>Создана</label>
                  <div className="info-value">
                    {new Date(formData.createdAt).toLocaleDateString("ru-RU")}
                  </div>
                </div>
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
        title="Удалить сделку?"
        message="При удалении сделки также будут удалены все связанные задачи и счета. Это действие невозможно отменить."
        relatedItems={[
          { label: "Задачи", count: relatedCounts.tasks },
          { label: "Счета", count: relatedCounts.invoices },
        ]}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        isLoading={loading}
        isDangerous={true}
      />
    </>
  );
}
