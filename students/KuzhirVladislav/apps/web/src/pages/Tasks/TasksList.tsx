import React from "react";
import { Link } from "react-router-dom";
import TasksBoard from "../../components/TasksBoard";

export default function TasksList() {
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
          <h1>Задачи — Доска</h1>
        </div>
        <Link to="/tasks/new">
          <button className="button">Создать задачу</button>
        </Link>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
        Управляйте задачами по статусам выполнения
      </p>
      <TasksBoard />
    </div>
  );
}
