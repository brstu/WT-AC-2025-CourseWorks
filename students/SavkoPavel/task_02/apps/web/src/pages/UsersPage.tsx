import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../lib/AuthProvider";
import { AppNav } from "../ui/AppNav";
import { PageLayout } from "../ui/PageLayout";

type Role = "ADMIN" | "AGENT" | "USER";

type UserRow = {
  id: string;
  email: string;
  role: Role;
  createdAt?: string;
};

export function UsersPage() {
  const auth = useAuth();

  const role = auth.payload?.role;
  if (role !== "ADMIN") return <Navigate to="/incidents" replace />;

  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [editEmails, setEditEmails] = useState<Record<string, string>>({});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("USER");

  const myUserId = auth.payload?.userId;

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.email.localeCompare(b.email));
  }, [users]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiRequest<UserRow[]>("/users");
      setUsers(res.data);
      setEditEmails((prev) => {
        const next: Record<string, string> = { ...prev };
        for (const u of res.data) {
          if (next[u.id] === undefined) next[u.id] = u.email;
        }
        // Drop removed users from local edit state
        for (const id of Object.keys(next)) {
          if (!res.data.some((u) => u.id === id)) delete next[id];
        }
        return next;
      });
    } catch (err: any) {
      setError(err?.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await apiRequest<UserRow>("/users", {
        method: "POST",
        body: {
          email,
          password,
          role: newRole,
        },
      });
      setEmail("");
      setPassword("");
      setNewRole("USER");
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create user");
    }
  }

  async function changeRole(userId: string, role: Role) {
    setError(null);
    try {
      await apiRequest(`/users/${userId}/role`, {
        method: "PATCH",
        body: { role },
      });
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to change role");
    }
  }

  async function updateEmail(userId: string) {
    setError(null);
    const email = (editEmails[userId] ?? "").trim();
    try {
      await apiRequest(`/users/${userId}`, {
        method: "PUT",
        body: { email },
      });
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update email");
    }
  }

  async function deleteUser(userId: string) {
    setError(null);
    try {
      await apiRequest(`/users/${userId}`, { method: "DELETE" });
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete user");
    }
  }

  return (
    <PageLayout title="Users" subtitle="Create users, change roles, delete users" headerRight={<AppNav />}>
      {error ? <div className="error">{error}</div> : null}

      <div className="card section">
        <h2 className="card-title">Create user</h2>
        <div className="divider" />
        <form onSubmit={createUser} className="stack">
          <div className="grid-2">
            <label>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
          </div>
          <label>
            Role
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}>
              <option value="USER">USER</option>
              <option value="AGENT">AGENT</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>

          <div className="row" style={{ justifyContent: "space-between" }}>
            <button className="btn btn-primary" type="submit" disabled={!email.trim() || password.length < 6}>
              Create
            </button>
            <span className="small">Password must be at least 6 chars.</span>
          </div>
        </form>
      </div>

      <div className="card section">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 className="card-title">Users</h2>
          <button className="btn" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="divider" />

        {sortedUsers.length === 0 ? (
          <div className="subtle">No users</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((u) =>
                (() => {
                  const editEmail = editEmails[u.id] ?? u.email;
                  const editEmailTrimmed = editEmail.trim();
                  const changed = editEmailTrimmed !== u.email;
                  const valid = editEmailTrimmed.length > 3 && editEmailTrimmed.includes("@");

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="stack" style={{ gap: 6 }}>
                          <input
                            value={editEmail}
                            onChange={(e) =>
                              setEditEmails((prev) => ({
                                ...prev,
                                [u.id]: e.target.value,
                              }))
                            }
                          />
                          <div className="small">current: {u.email}</div>
                        </div>
                        <div className="small" style={{ marginTop: 8 }}>
                          {u.id}
                        </div>
                        {u.createdAt ? <div className="small">{new Date(u.createdAt).toLocaleString()}</div> : null}
                      </td>
                      <td>
                        <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value as Role)} disabled={u.id === myUserId}>
                          <option value="USER">USER</option>
                          <option value="AGENT">AGENT</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        {u.id === myUserId ? <div className="small" style={{ marginTop: 6 }}>(you)</div> : null}
                      </td>
                      <td>
                        <div className="row">
                          <button className="btn btn-primary" onClick={() => updateEmail(u.id)} disabled={!changed || !valid}>
                            Save email
                          </button>
                          <button className="btn btn-danger" onClick={() => deleteUser(u.id)} disabled={u.id === myUserId}>
                            Delete
                          </button>
                        </div>
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
