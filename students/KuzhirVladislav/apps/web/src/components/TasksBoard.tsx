import React, { useEffect, useState } from "react";
import { Task } from "../types/models";
import { IconChevronDown } from "./Icons";
import tasksApi from "../api/tasks";
import TaskModal from "./TaskModal";
import "../styles/board.css";

export default function TasksBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const IconChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    setLoading(true);
    tasksApi
      .list()
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const getNotDoneTasks = () => tasks.filter((t) => !t.completed);
  const getDoneTasks = () => tasks.filter((t) => t.completed);

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const updateTaskStatus = async (task: Task, isCompleted: boolean) => {
    try {
      const payload = {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        completed: isCompleted,
        dealId: task.dealId || null,
        userId: task.userId || null,
      };

      const updatedTask = await tasksApi.update(String(Number(task.id)), payload as any);

      setTasks((prevTasks) => prevTasks.map((t) => (t.id === task.id ? updatedTask : t)));
    } catch (err: any) {
      console.error("Failed to update task status:", err);
      alert("Ошибка при обновлении статуса: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDragStart = (task: Task) => setDraggedTask(task);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (shouldBeCompleted: boolean) => {
    if (draggedTask) {
      if (draggedTask.completed !== shouldBeCompleted) {
        updateTaskStatus(draggedTask, shouldBeCompleted);
      }
      setDraggedTask(null);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalSave = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const RenderTaskCard = ({ task, isDone }: { task: Task; isDone: boolean }) => (
    <div
      key={task.id}
      className={`task-card ${isDone ? "completed" : ""}`}
      draggable
      onDragStart={() => handleDragStart(task)}
      onClick={() => handleTaskClick(task)}
      style={{
        cursor: "pointer",
        opacity: isDone ? 0.7 : 1,
        marginBottom: "12px",
        padding: "12px",
        borderLeft: isDone ? "4px solid #20ff7a" : "4px solid #9fb0c8",
      }}
    >
      <div className="task-content">
        <div
          className="task-title"
          style={{
            fontWeight: 600,
            fontSize: "16px",
            textDecoration: isDone ? "line-through" : "none",
            marginBottom: "8px",
          }}
        >
          {task.title}
        </div>

        {task.description && (
          <div
            className="task-desc"
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              marginBottom: "8px",
              whiteSpace: "pre-wrap",
            }}
          >
            {task.description}
          </div>
        )}

        <div
          className="task-meta"
          style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}
        >
          {task.dueDate && (
            <div className="task-due">
              📅 <strong>Дедлайн:</strong>{" "}
              {new Date(task.dueDate).toLocaleString("ru-RU", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}

          {task.dealId && (
            <div className="task-deal" style={{ color: "var(--accent)" }}>
              📋 <strong>Сделка ID:</strong> {task.dealId}
            </div>
          )}

          {task.userId && (
            <div className="task-user" style={{ color: "var(--muted)" }}>
              👤 <strong>Ответственный ID:</strong> {task.userId}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="card">Загрузка задач...</div>;
  if (error)
    return (
      <div className="card" style={{ color: "var(--accent-3)" }}>
        Ошибка: {error}
      </div>
    );

  return (
    <>
      <div className="board-container">
        {tasks.length === 0 ? (
          <div className="card">Нет задач</div>
        ) : (
          <div className="board">
            <div
              className={`board-column ${collapsedSections.has("not-done") ? "collapsed" : ""}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(false)}
            >
              <div className="board-header">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                  <button className="board-toggle" onClick={() => toggleSection("not-done")}>
                    <IconChevronDown
                      style={{
                        transform: collapsedSections.has("not-done")
                          ? "rotate(-90deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <h3>⭕ Не выполнено</h3>
                </div>
                <span className="board-count">{getNotDoneTasks().length}</span>
              </div>
              {!collapsedSections.has("not-done") && (
                <div className="board-cards">
                  {getNotDoneTasks().map((task) => (
                    <RenderTaskCard key={task.id} task={task} isDone={false} />
                  ))}
                  {getNotDoneTasks().length === 0 && (
                    <div className="board-empty">Все задачи выполнены! 🎉</div>
                  )}
                </div>
              )}
            </div>

            <div
              className={`board-column ${collapsedSections.has("done") ? "collapsed" : ""}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(true)}
            >
              <div className="board-header">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                  <button className="board-toggle" onClick={() => toggleSection("not-done")}>
                    <span
                      style={{
                        display: "inline-flex",
                        transform: collapsedSections.has("not-done")
                          ? "rotate(-90deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      <IconChevronDown />
                    </span>
                  </button>
                  <h3>✅ Выполнено</h3>
                </div>
                <span className="board-count">{getDoneTasks().length}</span>
              </div>
              {!collapsedSections.has("done") && (
                <div className="board-cards">
                  {getDoneTasks().map((task) => (
                    <RenderTaskCard key={task.id} task={task} isDone={true} />
                  ))}
                  {getDoneTasks().length === 0 && (
                    <div className="board-empty">Нет выполненных задач</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
      />
    </>
  );
}
