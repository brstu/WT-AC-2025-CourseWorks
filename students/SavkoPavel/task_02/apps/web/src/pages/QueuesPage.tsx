import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../lib/AuthProvider";
import { AppNav } from "../ui/AppNav";
import { PageLayout } from "../ui/PageLayout";

type Role = "ADMIN" | "AGENT" | "USER";

type Queue = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  sla: null | {
    id: string;
    reactionTimeMinutes: number;
    resolutionTimeMinutes: number;
  };
};

type User = {
  id: string;
  email: string;
  role: Role;
};

type QueueMember = {
  id: string;
  queueId: string;
  userId: string;
  createdAt: string;
  user: User;
};

export function QueuesPage() {
  const auth = useAuth();

  const role = auth.payload?.role;
  if (role !== "ADMIN") return <Navigate to="/incidents" replace />;

  const [queues, setQueues] = useState<Queue[]>([]);
  const [agents, setAgents] = useState<User[]>([]);

  const [selectedQueueId, setSelectedQueueId] = useState<string>("");
  const [members, setMembers] = useState<QueueMember[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedQueue = useMemo(
    () => queues.find((q) => q.id === selectedQueueId) ?? null,
    [queues, selectedQueueId]
  );

  async function loadQueues() {
    const res = await apiRequest<Queue[]>("/queues");
    setQueues(res.data);

    if (!selectedQueueId && res.data.length > 0) {
      setSelectedQueueId(res.data[0].id);
    }
  }

  async function loadAgents() {
    const res = await apiRequest<User[]>("/users");
    setAgents(res.data.filter((u) => u.role === "AGENT"));
  }

  async function loadMembers(queueId: string) {
    const res = await apiRequest<QueueMember[]>(`/queues/${queueId}/agents`);
    setMembers(res.data);
  }

  async function loadAll() {
    setError(null);
    setLoading(true);
    try {
      await Promise.all([loadQueues(), loadAgents()]);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedQueueId) return;
    setError(null);
    loadMembers(selectedQueueId).catch((err: any) => setError(err?.message ?? "Failed to load queue agents"));
  }, [selectedQueueId]);

  async function createQueue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiRequest("/queues", {
        method: "POST",
        body: {
          name,
          ...(description.trim() ? { description: description.trim() } : {}),
        },
      });
      setName("");
      setDescription("");
      await loadQueues();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create queue");
    }
  }

  async function addAgent() {
    if (!selectedQueueId || !selectedAgentId) return;
    setError(null);
    try {
      await apiRequest(`/queues/${selectedQueueId}/agents`, {
        method: "POST",
        body: { userId: selectedAgentId },
      });
      await loadMembers(selectedQueueId);
    } catch (err: any) {
      setError(err?.message ?? "Failed to add agent");
    }
  }

  async function removeAgent(userId: string) {
    if (!selectedQueueId) return;
    setError(null);
    try {
      await apiRequest(`/queues/${selectedQueueId}/agents/${userId}`, {
        method: "DELETE",
      });
      await loadMembers(selectedQueueId);
    } catch (err: any) {
      setError(err?.message ?? "Failed to remove agent");
    }
  }

  return (
    <PageLayout title="Queues" subtitle="Manage agent ↔ queue membership" headerRight={<AppNav />}>
      {error ? <div className="error">{error}</div> : null}

      <div className="card section">
        <h2 className="card-title">Create queue</h2>
        <form onSubmit={createQueue} className="stack" style={{ marginTop: 10 }}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Description (optional)
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="row">
            <button className="btn btn-primary" type="submit" disabled={!name.trim()}>
              Create
            </button>
          </div>
        </form>
      </div>

      <div
        className="section"
        style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16, alignItems: "start" }}
      >
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h2 className="card-title">Queues</h2>
            <button className="btn" onClick={loadAll} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="stack" style={{ marginTop: 10 }}>
            {queues.map((q) => {
              const isActive = q.id === selectedQueueId;
              return (
                <button
                  key={q.id}
                  onClick={() => setSelectedQueueId(q.id)}
                  className={isActive ? "list-button list-button-active" : "list-button"}
                >
                  <div style={{ fontWeight: 800 }}>{q.name}</div>
                  <div className="small" style={{ marginTop: 4 }}>
                    {q.id}
                  </div>
                  <div className="small" style={{ marginTop: 4 }}>
                    SLA: {q.sla ? `${q.sla.reactionTimeMinutes}/${q.sla.resolutionTimeMinutes} min` : "Not set"}
                  </div>
                </button>
              );
            })}
            {queues.length === 0 ? <div className="subtle">No queues</div> : null}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Queue agents</h2>

          {selectedQueue ? (
            <div className="section">
              <div className="subtle">
                Selected queue: <b>{selectedQueue.name}</b>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <span className="pill">SLA: {selectedQueue.sla ? "configured" : "not set"}</span>
                <Link to={`/queues/${selectedQueue.id}/incidents`} className="pill">
                  Incidents
                </Link>
                <Link to="/sla" className="pill">
                  Open SLA
                </Link>
              </div>
            </div>
          ) : (
            <div className="subtle section">Select a queue</div>
          )}

          <div className="row section" style={{ alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <label>
                Add AGENT
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  disabled={!selectedQueueId}
                >
                  <option value="">Select AGENT to add…</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.email} ({a.id})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button className="btn btn-primary" onClick={addAgent} disabled={!selectedQueueId || !selectedAgentId}>
              Add
            </button>
          </div>

          <div className="section">
            {members.length === 0 ? (
              <div className="subtle">No agents assigned</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>{m.user.email}</div>
                        <div className="small" style={{ marginTop: 4 }}>
                          {m.user.id}
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-danger" onClick={() => removeAgent(m.userId)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
