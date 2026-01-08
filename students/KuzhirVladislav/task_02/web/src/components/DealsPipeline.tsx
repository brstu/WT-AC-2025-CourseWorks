import React, { useEffect, useState } from "react";
import { Deal, Stage } from "../types/models";
import dealsApi from "../api/deals";
import stagesApi from "../api/stages";
import { IconChevronDown } from "./Icons";
import DealModal from "./DealModal";
import "../styles/pipeline.css";

export default function DealsPipeline() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [collapsedStages, setCollapsedStages] = useState<Set<string>>(new Set());
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = () => {
    setLoading(true);
    Promise.all([stagesApi.list(), dealsApi.list()])
      .then(([stagesData, dealsData]) => {
        setStages(stagesData.sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0)));
        setDeals(dealsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const getDealsByStage = (stageId: number) => {
    return deals.filter((d) => d.stageId === stageId);
  };
  const toggleStage = (stageId: string) => {
    const newCollapsed = new Set(collapsedStages);
    if (newCollapsed.has(stageId)) {
      newCollapsed.delete(stageId);
    } else {
      newCollapsed.add(stageId);
    }
    setCollapsedStages(newCollapsed);
  };

  const changeDealStage = async (deal: Deal, newStageId: number) => {
    if (deal.stageId === newStageId) return;

    try {
      const updatedDeal = await dealsApi.update(String(deal.id), {
        ...deal,
        stageId: newStageId,
      });
      setDeals(deals.map((d) => (d.id === deal.id ? updatedDeal : d)));
    } catch (err: any) {
      console.error("Failed to update deal:", err);
      alert("Ошибка при перемещении: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: number) => {
    if (draggedDeal) {
      changeDealStage(draggedDeal, stageId);
      setDraggedDeal(null);
    }
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const handleModalSave = (updatedDeal: Deal) => {
    setDeals(deals.map((d) => (d.id === updatedDeal.id ? updatedDeal : d)));
  };

  if (loading) {
    return <div className="card">Загрузка воронки...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ color: "var(--accent-3)" }}>
        Ошибка: {error}
      </div>
    );
  }

  return (
    <>
      <div className="pipeline-container">
        {stages.length === 0 ? (
          <div className="card">Нет этапов. Создайте этапы для отображения воронки.</div>
        ) : (
          <div className="pipeline">
            {stages.map((stage) => {
              const stageDeal = getDealsByStage(stage.id);
              const isCollapsed = collapsedStages.has(String(stage.id));

              return (
                <div
                  key={stage.id}
                  className={`pipeline-column ${isCollapsed ? "collapsed" : ""}`}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(stage.id)}
                >
                  <div className="pipeline-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                      <button
                        className={`pipeline-toggle ${isCollapsed ? "collapsed" : ""}`}
                        onClick={() => toggleStage(String(stage.id))}
                        title={isCollapsed ? "Развернуть" : "Свернуть"}
                      >
                        <IconChevronDown />
                      </button>
                      <h3>{stage.name}</h3>
                    </div>
                    <span className="pipeline-count">{stageDeal.length}</span>
                  </div>
                  {!isCollapsed && (
                    <div className="pipeline-cards">
                      {stageDeal.map((deal) => (
                        <div
                          key={deal.id}
                          className="deal-card"
                          draggable
                          onDragStart={() => handleDragStart(deal)}
                          onClick={() => handleDealClick(deal)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="deal-title">{deal.title}</div>
                          {deal.amount !== undefined && (
                            <div className="deal-amount">💰 ${deal.amount.toLocaleString()}</div>
                          )}
                          {deal.description && <div className="deal-desc">{deal.description}</div>}
                        </div>
                      ))}
                      {stageDeal.length === 0 && <div className="pipeline-empty">Нет сделок</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <DealModal
        deal={selectedDeal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        onDelete={loadDeals}
      />
    </>
  );
}
