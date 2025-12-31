import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
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

type Queue = {
  id: string;
  name: string;
};

export function QueueIncidentsPage() {
  const auth = useAuth();
  const role = auth.payload?.role;

  const { queueId } = useParams();
  if (role !== "AGENT") return <Navigate to="/incidents" replace />;
  if (!queueId) return <Navigate to="/my-queues" replace />;

  const [queues, setQueues] = useState<Queue[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const queueName = useMemo(() => {
    return queues.find((q) => q.id === queueId)?.name ?? queueId;
  }, [queues, queueId]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const [queuesRes, incidentsRes] = await Promise.all([
        apiRequest<Queue[]>("/queues"),
        apiRequest<Incident[]>("/incidents"),
      ]);

      setQueues(queuesRes.data);
      setIncidents(incidentsRes.data.filter((i) => i.queueId === queueId));
    } catch (err: any) {
      setError(err?.message ?? "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueId]);

  async function takeIncident(id: string) {
    setError(null);
    try {
      await apiRequest(`/incidents/${id}`, { method: "PATCH", body: { take: true } });
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to take incident");
    }
  }

  return (
    <PageLayout title="Incidents by queue" subtitle={`Queue: ${queueName}`} headerRight={<AppNav />}>
      {error ? <div className="error">{error}</div> : null}

      <div className="row section">
        <Link to="/my-queues" className="pill">
          Back to my queues
        </Link>
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="section">
        {incidents.length === 0 ? (
          <div className="subtle">No incidents in this queue</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div style={{ fontWeight: 800 }}>{i.title}</div>
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
                  <td>
                    <button className="btn" onClick={() => takeIncident(i.id)} disabled={!!i.assignedToId}>
                      {i.assignedToId ? "Taken" : "Take"}
                    </button>
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
