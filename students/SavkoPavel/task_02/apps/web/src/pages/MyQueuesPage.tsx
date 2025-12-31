import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../lib/AuthProvider";
import { AppNav } from "../ui/AppNav";
import { PageLayout } from "../ui/PageLayout";

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

export function MyQueuesPage() {
  const auth = useAuth();
  const role = auth.payload?.role;

  if (role !== "AGENT") return <Navigate to="/incidents" replace />;

  const [queues, setQueues] = useState<Queue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiRequest<Queue[]>("/queues");
      setQueues(res.data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load queues");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageLayout title="My queues" subtitle="Queues where you are assigned" headerRight={<AppNav />}>
      {error ? <div className="error">{error}</div> : null}

      <div className="row section">
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="section">
        {queues.length === 0 ? (
          <div className="subtle">No queues assigned</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Queue</th>
                <th>SLA</th>
              </tr>
            </thead>
            <tbody>
              {queues.map((q) => (
                <tr key={q.id}>
                  <td>
                    <div style={{ fontWeight: 800 }}>{q.name}</div>
                    <div className="small" style={{ marginTop: 4 }}>
                      {q.id}
                    </div>
                    {q.description ? (
                      <div className="small" style={{ marginTop: 4 }}>
                        {q.description}
                      </div>
                    ) : null}
                    <div style={{ marginTop: 8 }}>
                      <Link to={`/my-queues/${q.id}/incidents`}>Incidents</Link>
                    </div>
                  </td>
                  <td>
                    {q.sla ? (
                      <span className="pill">
                        {q.sla.reactionTimeMinutes}/{q.sla.resolutionTimeMinutes} min
                      </span>
                    ) : (
                      <span className="subtle">Not set</span>
                    )}
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
