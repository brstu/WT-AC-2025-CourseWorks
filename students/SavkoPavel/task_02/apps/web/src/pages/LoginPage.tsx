import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { ThemeToggle } from "../ui/ThemeToggle";

export function LoginPage() {
  const auth = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("admin@test.local");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.login(email, password);
      nav("/incidents");
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div className="page-title">
          <h1>Incident Management System</h1>
          <div className="subtle">Sign in to continue</div>
        </div>
        <div className="nav">
          <ThemeToggle />
        </div>
      </div>

      <div className="section">
        <div className="card">
          <h2 className="card-title">Login</h2>
          <div className="divider" />

          <form onSubmit={onSubmit} className="stack">
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
                autoComplete="current-password"
              />
            </label>

            {error ? <div className="error">{error}</div> : null}

            <div className="row" style={{ justifyContent: "space-between" }}>
              <button className="btn btn-primary" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Login"}
              </button>
              <span className="small">
                No account? <Link to="/register">Register</Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
