import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../lib/AuthProvider";
import { AppNav } from "../ui/AppNav";
import { PageLayout } from "../ui/PageLayout";

type IncidentPriority = "low" | "medium" | "high" | "critical";
type IncidentStatus = "open" | "in_progress" | "escalated" | "resolved";

type Incident = {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  queueId: string;
  createdAt: string;
  assignedToId: string | null;
};

type QueueOption = {
  id: string;
  name: string;
  sla?: null | {
    id: string;
    reactionTimeMinutes: number;
    resolutionTimeMinutes: number;
  };
};

export function IncidentsPage() {
  const auth = useAuth();

  const role = auth.payload?.role;

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [queues, setQueues] = useState<QueueOption[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [queueId, setQueueId] = useState("");

  const canCreate = role === "ADMIN" || role === "USER";
  const canDelete = role === "ADMIN";
  const canTake = role === "AGENT";

  const header = useMemo(() => {
    if (!auth.payload) return "Incidents";
    return `Incidents (role: ${auth.payload.role})`;
  }, [auth.payload]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiRequest<Incident[]>("/incidents");
      setIncidents(res.data);

      if (canCreate) {
        const queuesRes = await apiRequest<QueueOption[]>("/queues");
        const withSla = queuesRes.data.filter((q) => !!q.sla);
        setQueues(withSla);
        if (!queueId && withSla.length > 0) setQueueId(withSla[0].id);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createIncident(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiRequest("/incidents", {
        method: "POST",
        body: {
          title,
          description,
          ...(queueId.trim() ? { queueId: queueId.trim() } : {}),
        },
      });
      setTitle("");
      setDescription("");
      // keep selected queue
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create incident");
    }
  }

  async function takeIncident(id: string) {
    setError(null);
    try {
      await apiRequest(`/incidents/${id}`, { method: "PATCH", body: { take: true } });
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to take incident");
    }
  }

  async function deleteIncident(id: string) {
    setError(null);
    try {
      await apiRequest(`/incidents/${id}`, { method: "DELETE" });
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete incident");
    }
  }

  return (
    <PageLayout
      title={header}
      subtitle={`JWT userId: ${auth.payload?.userId ?? "-"}`}
      headerRight={<AppNav />}
    >
      {error ? <div className="error">{error}</div> : null}

      {canCreate ? (
        <div className="card section">
          <h2 className="card-title">Create incident</h2>
          <div className="divider" />

          <form onSubmit={createIncident} className="stack">
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </label>
            <label>
              Queue (SLA-configured)
              <select value={queueId} onChange={(e) => setQueueId(e.target.value)} disabled={queues.length === 0}>
                {queues.length === 0 ? <option value="">No queues with SLA</option> : null}
                {queues.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name} ({q.id})
                  </option>
                ))}
              </select>
            </label>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={!title.trim() || !description.trim() || queues.length === 0}
              >
                Create
              </button>
              {queues.length === 0 ? (
                <span className="small">Нужно настроить SLA для хотя бы одной очереди (ADMIN → SLA).</span>
              ) : (
                <span className="small">Выберите очередь, для которой задан SLA.</span>
              )}
            </div>
          </form>
        </div>
      ) : null}

      <div className="row section">
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
        <Link to="/login" className="small">
          Go to login
        </Link>
      </div>

      <div className="section">
        {incidents.length === 0 ? (
          <div className="subtle">No incidents</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Queue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{i.title}</div>
                    <div className="subtle" style={{ marginTop: 4 }}>
                      {i.description}
                    </div>
                    <div className="small" style={{ marginTop: 6 }}>
                      {i.id}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Link to={`/incidents/${i.id}`}>Open</Link>
                    </div>
                  </td>
                  <td>{i.status}</td>
                  <td>{i.priority}</td>
                  <td>{i.queueId}</td>
                  <td>
                    <div className="row">
                      {canTake ? (
                        <button className="btn" onClick={() => takeIncident(i.id)} disabled={!!i.assignedToId}>
                          {i.assignedToId ? "Taken" : "Take"}
                        </button>
                      ) : null}
                      {canDelete ? (
                        <button className="btn btn-danger" onClick={() => deleteIncident(i.id)}>
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageLayout>
  );
}
