import React, { useEffect, useState } from "react";
import { Stage } from "../../types/models";
import stagesApi from "../../api/stages";
import Skeleton from "../../components/UI/Skeleton";

export default function StagesList() {
  const [items, setItems] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStageName, setNewStageName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    setLoading(true);
    stagesApi
      .list()
      .then((r) => {
        setItems(r.sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newStageName.trim()) return;
    try {
      const newStage = await stagesApi.create({
        name: newStageName,
        stageOrder: items.length, // Установка начального порядка
      });
      setItems([...items, newStage]);
      setNewStageName("");
    } catch (err) {
      console.error("Failed to create stage:", err);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      const updated = await stagesApi.update(String(id), { name: editingName });
      setItems(items.map((s) => (s.id === id ? updated : s)));
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      console.error("Failed to update stage:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены?")) return;
    try {
      await stagesApi.remove(String(id));
      setItems(items.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete stage:", err);
    }
  };

  const updateItemsOrder = async (newItems: Stage[]) => {
    try {
      const updates = newItems.map((stage, idx) =>
        stagesApi.update(String(stage.id), { ...stage, stageOrder: idx })
      );
      await Promise.all(updates);
      setItems(newItems);
    } catch (err) {
      console.error("Failed to move stage:", err);
      alert("Ошибка при сохранении порядка");
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    updateItemsOrder(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    updateItemsOrder(newItems);
  };

  return (
    <div>
      <h1>Этапы продаж</h1>
      <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
        Управляйте этапами продажного цикла
      </p>

      <div className="card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <input
            type="text"
            className="input"
            placeholder="Новый этап..."
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreate()}
          />
          <button className="button" onClick={handleCreate}>
            Добавить
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <Skeleton rows={5} />
        </div>
      ) : (
        <div className="list">
          {items.length === 0 && <div className="card">Этапы не добавлены</div>}
          {items.map((stage, index) => (
            <div
              key={stage.id}
              className="item"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              {editingId === stage.id ? (
                <input
                  type="text"
                  className="input"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  autoFocus
                  style={{ flex: 1 }}
                />
              ) : (
                <div style={{ fontWeight: 700 }}>
                  {index + 1}. {stage.name}
                </div>
              )}
              <div style={{ display: "flex", gap: "6px" }}>
                {editingId === stage.id ? (
                  <>
                    <button className="button" onClick={() => handleUpdate(stage.id)}>
                      Сохранить
                    </button>
                    <button className="button secondary" onClick={() => setEditingId(null)}>
                      Отмена
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="button secondary"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                    >
                      ↑
                    </button>
                    <button
                      className="button secondary"
                      disabled={index === items.length - 1}
                      onClick={() => handleMoveDown(index)}
                    >
                      ↓
                    </button>
                    <button
                      className="button secondary"
                      onClick={() => {
                        setEditingId(stage.id);
                        setEditingName(stage.name);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="button secondary"
                      style={{ color: "var(--accent-3)" }}
                      onClick={() => handleDelete(stage.id)}
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
