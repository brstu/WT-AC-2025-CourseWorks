import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../lib/AuthProvider";
import { AppNav } from "../ui/AppNav";
import { PageLayout } from "../ui/PageLayout";

type Role = "ADMIN" | "AGENT" | "USER";

type IncidentPriority = "low" | "medium" | "high" | "critical";
type IncidentStatus = "open" | "in_progress" | "escalated" | "resolved";

type Incident = {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  queueId: string;
  createdById: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; email: string; role: Role };
  assignedTo?: { id: string; email: string; role: Role } | null;
};

type Comment = {
  id: string;
  incidentId: string;
  message: string;
  authorId: string;
  createdAt: string;
  author: { id: string; email: string; role: Role };
};

export function IncidentDetailsPage() {
  const auth = useAuth();
  const nav = useNavigate();
  const { id } = useParams();

  const role = auth.payload?.role;
  const userId = auth.payload?.userId;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<IncidentPriority>("low");
  const [editStatus, setEditStatus] = useState<IncidentStatus>("open");

  const [newComment, setNewComment] = useState("");

  const canEditAsUser = role === "USER" && incident?.createdById === userId;
  const canEditAsAdmin = role === "ADMIN";
  const canEditAsAgent = role === "AGENT";

  const canEditFields = canEditAsAdmin || canEditAsAgent || canEditAsUser;

  const canTake = role === "AGENT";
  const canDelete = role === "ADMIN";

  const header = useMemo(() => {
    if (!incident) return "Incident";
    return `${incident.title}`;
  }, [incident]);

  if (!id) return <Navigate to="/incidents" replace />;

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const [incRes, commentsRes] = await Promise.all([
        apiRequest<Incident>(`/incidents/${id}`),
        apiRequest<Comment[]>(`/incidents/${id}/comments`),
      ]);
      setIncident(incRes.data);
      setComments(commentsRes.data);

      setEditTitle(incRes.data.title);
      setEditDescription(incRes.data.description);
      setEditPriority(incRes.data.priority);
      setEditStatus(incRes.data.status);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load incident");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save() {
    if (!incident) return;
    setError(null);

    const body: any = {};

    // USER: can edit title/description/priority only
    if (canEditAsUser) {
      if (editTitle !== incident.title) body.title = editTitle;
      if (editDescription !== incident.description) body.description = editDescription;
      if (editPriority !== incident.priority) body.priority = editPriority;
    }

    // AGENT: workflow fields only
    if (canEditAsAgent) {
      if (editStatus !== incident.status) body.status = editStatus;
      if (editPriority !== incident.priority) body.priority = editPriority;
    }

    // ADMIN: can edit everything shown
    if (canEditAsAdmin) {
      if (editTitle !== incident.title) body.title = editTitle;
      if (editDescription !== incident.description) body.description = editDescription;
      if (editStatus !== incident.status) body.status = editStatus;
      if (editPriority !== incident.priority) body.priority = editPriority;
    }

    if (Object.keys(body).length === 0) {
      return;
    }

    try {
      await apiRequest<Incident>(`/incidents/${incident.id}`, { method: "PATCH", body });
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to save changes");
    }
  }

  async function take() {
    if (!incident) return;
    setError(null);
    try {
      await apiRequest<Incident>(`/incidents/${incident.id}`, { method: "PATCH", body: { take: true } });
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to take incident");
    }
  }

  async function remove() {
    if (!incident) return;
    setError(null);
    try {
      await apiRequest(`/incidents/${incident.id}`, { method: "DELETE" });
      nav("/incidents");
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete incident");
    }
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!incident) return;
    if (!newComment.trim()) return;

    setError(null);
    try {
      await apiRequest(`/incidents/${incident.id}/comments`, {
        method: "POST",
        body: { message: newComment.trim() },
      });
      setNewComment("");
      const res = await apiRequest<Comment[]>(`/incidents/${incident.id}/comments`);
      setComments(res.data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to add comment");
    }
  }

  return (
    <PageLayout title={header} subtitle={id} headerRight={<AppNav />}>
      <div className="row">
        <Link to="/incidents" className="pill">
          Back
        </Link>
        {incident?.queueId ? <span className="pill">Queue: {incident.queueId}</span> : null}
        {incident?.priority ? <span className="pill">Priority: {incident.priority}</span> : null}
        {incident?.status ? <span className="pill">Status: {incident.status}</span> : null}
      </div>

      {error ? <div className="error section">{error}</div> : null}
      {loading ? <div className="subtle section">Loading...</div> : null}

      {incident ? (
        <div className="card section">
          <h2 className="card-title">Details</h2>
          <div className="divider" />

          <div className="stack">
            <label>
              Title
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} disabled={!canEditFields || canEditAsAgent} />
            </label>

            <label>
              Description
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                disabled={!canEditFields || canEditAsAgent}
              />
            </label>

            <div className="grid-2">
              <label>
                Status
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as IncidentStatus)} disabled={!canEditAsAdmin && !canEditAsAgent}>
                  <option value="open">open</option>
                  <option value="in_progress">in_progress</option>
                  <option value="escalated">escalated</option>
                  <option value="resolved">resolved</option>
                </select>
              </label>

              <label>
                Priority
                <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as IncidentPriority)} disabled={!canEditFields}>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="critical">critical</option>
                </select>
              </label>
            </div>

            <div className="grid-2">
              <div className="small">
                Created by: <span className="kbd">{incident.createdBy?.email ?? incident.createdById}</span>
              </div>
              <div className="small">
                Assigned to: <span className="kbd">{incident.assignedTo?.email ?? incident.assignedToId ?? "-"}</span>
              </div>
            </div>

            <div className="row">
              <button className="btn btn-primary" onClick={save} disabled={!canEditFields}>
                Save
              </button>
              {canTake ? (
                <button className="btn" onClick={take} disabled={!!incident.assignedToId}>
                  {incident.assignedToId ? "Taken" : "Take"}
                </button>
              ) : null}
              {canDelete ? (
                <button className="btn btn-danger" onClick={remove}>
                  Delete
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {incident ? (
        <div className="card section">
          <h2 className="card-title">Comments</h2>
          <div className="divider" />

          <form onSubmit={addComment} className="row">
            <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." style={{ flex: 1 }} />
            <button className="btn btn-primary" type="submit" disabled={!newComment.trim()}>
              Add
            </button>
          </form>

          <div className="section stack">
            {comments.length === 0 ? (
              <div className="subtle">No comments</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="card" style={{ padding: 12 }}>
                  <div className="small">
                    {c.author.email} • {new Date(c.createdAt).toLocaleString()}
                  </div>
                  <div style={{ marginTop: 8 }}>{c.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </PageLayout>
  );
}
