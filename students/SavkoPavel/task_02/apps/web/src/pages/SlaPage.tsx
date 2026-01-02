import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../lib/AuthProvider";
import { AppNav } from "../ui/AppNav";
import { PageLayout } from "../ui/PageLayout";

type SlaRow = {
  id: string;
  queueId: string;
  reactionTimeMinutes: number;
  resolutionTimeMinutes: number;
  createdAt?: string;
  queue?: {
    id: string;
    name: string;
    description?: string | null;
  };
};

type QueueOption = {
  id: string;
  name: string;
};

export function SlaPage() {
  const auth = useAuth();
  const role = auth.payload?.role;

  const canView = role === "ADMIN" || role === "AGENT";
  const canEdit = role === "ADMIN";
  if (!canView) return <Navigate to="/incidents" replace />;

  const [rows, setRows] = useState<SlaRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [queues, setQueues] = useState<QueueOption[]>([]);

  const [queueId, setQueueId] = useState("");
  const [reactionTimeMinutes, setReactionTimeMinutes] = useState<number>(60);
  const [resolutionTimeMinutes, setResolutionTimeMinutes] = useState<number>(240);

  const [editReactions, setEditReactions] = useState<Record<string, number>>({});
  const [editResolutions, setEditResolutions] = useState<Record<string, number>>({});

  const header = useMemo(() => {
    return canEdit ? "SLA (ADMIN)" : "SLA (AGENT)";
  }, [canEdit]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const [res, queuesRes] = await Promise.all([
        apiRequest<SlaRow[]>("/sla"),
        canEdit ? apiRequest<any[]>("/queues") : Promise.resolve(null),
      ]);
      setRows(res.data);

      if (canEdit && queuesRes) {
        const options: QueueOption[] = (queuesRes.data ?? []).map((q: any) => ({
          id: q.id,
          name: q.name,
        }));
        setQueues(options);
        if (!queueId && options.length > 0) setQueueId(options[0].id);
      }

      setEditReactions((prev) => {
        const next: Record<string, number> = { ...prev };
        for (const r of res.data) {
          if (next[r.id] === undefined) next[r.id] = r.reactionTimeMinutes;
        }
        for (const id of Object.keys(next)) {
          if (!res.data.some((r) => r.id === id)) delete next[id];
        }
        return next;
      });
      setEditResolutions((prev) => {
        const next: Record<string, number> = { ...prev };
        for (const r of res.data) {
          if (next[r.id] === undefined) next[r.id] = r.resolutionTimeMinutes;
        }
        for (const id of Object.keys(next)) {
          if (!res.data.some((r) => r.id === id)) delete next[id];
        }
        return next;
      });
    } catch (err: any) {
      setError(err?.message ?? "Failed to load SLA");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createSla(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    setError(null);
    try {
      await apiRequest<SlaRow>("/sla", {
        method: "POST",
        body: {
          queueId: queueId.trim(),
          reactionTimeMinutes,
          resolutionTimeMinutes,
        },
      });
      setQueueId("");
      setReactionTimeMinutes(60);
      setResolutionTimeMinutes(240);
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create SLA");
    }
  }

  async function saveRow(id: string) {
    if (!canEdit) return;
    setError(null);
    const reaction = editReactions[id];
    const resolution = editResolutions[id];
    try {
      await apiRequest<SlaRow>(`/sla/${id}`, {
        method: "PUT",
        body: {
          reactionTimeMinutes: reaction,
          resolutionTimeMinutes: resolution,
        },
      });
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update SLA");
    }
  }

  return (
    <PageLayout
      title={header}
      subtitle={canEdit ? "Manage SLA rules for queues" : "Visible only for your assigned queues"}
      headerRight={<AppNav />}
    >
      {error ? <div className="error">{error}</div> : null}

      <div className="row section">
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {canEdit ? (
        <div className="card section">
          <h2 className="card-title">Create SLA</h2>
          <div className="divider" />
          <form onSubmit={createSla} className="stack">
            <label>
              Queue
              <select value={queueId} onChange={(e) => setQueueId(e.target.value)}>
                {queues.length === 0 ? <option value="">No queues</option> : null}
                {queues.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name} ({q.id})
                  </option>
                ))}
              </select>
            </label>
            <div className="grid-2">
              <label>
                Reaction time (minutes)
                <input
                  type="number"
                  value={reactionTimeMinutes}
                  min={1}
                  onChange={(e) => setReactionTimeMinutes(Number(e.target.value))}
                />
              </label>
              <label>
                Resolution time (minutes)
                <input
                  type="number"
                  value={resolutionTimeMinutes}
                  min={1}
                  onChange={(e) => setResolutionTimeMinutes(Number(e.target.value))}
                />
              </label>
            </div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={!queueId.trim() || reactionTimeMinutes <= 0 || resolutionTimeMinutes <= 0 || queues.length === 0}
              >
                Create
              </button>
              <span className="small">Select a queue to attach an SLA.</span>
            </div>
          </form>
        </div>
      ) : null}

      <div className="section">
        {rows.length === 0 ? (
          <div className="subtle">No SLA rules visible</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Queue</th>
                <th>Reaction</th>
                <th>Resolution</th>
                <th>Meta</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) =>
                (() => {
                  const reaction = editReactions[r.id] ?? r.reactionTimeMinutes;
                  const resolution = editResolutions[r.id] ?? r.resolutionTimeMinutes;
                  const changed = reaction !== r.reactionTimeMinutes || resolution !== r.resolutionTimeMinutes;
                  const valid = reaction > 0 && resolution > 0;

                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>{r.queue?.name ?? r.queueId}</div>
                        <div className="small" style={{ marginTop: 4 }}>
                          {r.queueId}
                        </div>
                        {r.queue?.description ? <div className="small">{r.queue.description}</div> : null}
                      </td>
                      <td>
                        {canEdit ? (
                          <input
                            type="number"
                            min={1}
                            value={reaction}
                            onChange={(e) => setEditReactions((prev) => ({ ...prev, [r.id]: Number(e.target.value) }))}
                            style={{ maxWidth: 160 }}
                          />
                        ) : (
                          <span className="pill">{r.reactionTimeMinutes} min</span>
                        )}
                      </td>
                      <td>
                        {canEdit ? (
                          <input
                            type="number"
                            min={1}
                            value={resolution}
                            onChange={(e) => setEditResolutions((prev) => ({ ...prev, [r.id]: Number(e.target.value) }))}
                            style={{ maxWidth: 160 }}
                          />
                        ) : (
                          <span className="pill">{r.resolutionTimeMinutes} min</span>
                        )}
                      </td>
                      <td>
                        <div className="small">SLA id: {r.id}</div>
                        {r.createdAt ? <div className="small">Created: {new Date(r.createdAt).toLocaleString()}</div> : null}

                        {canEdit ? (
                          <div style={{ marginTop: 10 }}>
                            <button className="btn btn-primary" onClick={() => saveRow(r.id)} disabled={!changed || !valid}>
                              Save
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })()
              )}
            </tbody>
          </table>
        )}
      </div>
    </PageLayout>
  );
}
