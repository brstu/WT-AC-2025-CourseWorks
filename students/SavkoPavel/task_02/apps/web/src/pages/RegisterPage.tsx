import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { ThemeToggle } from "../ui/ThemeToggle";

export function RegisterPage() {
  const auth = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.register(email, password);
      nav("/login");
    } catch (err: any) {
      setError(err?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div className="page-title">
          <h1>Incident Management System</h1>
          <div className="subtle">Create your account</div>
        </div>
        <div className="nav">
          <ThemeToggle />
        </div>
      </div>

      <div className="section">
        <div className="card">
          <h2 className="card-title">Register</h2>
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
                autoComplete="new-password"
              />
            </label>

            {error ? <div className="error">{error}</div> : null}

            <div className="row" style={{ justifyContent: "space-between" }}>
              <button className="btn btn-primary" disabled={loading} type="submit">
                {loading ? "Creating..." : "Register"}
              </button>
              <span className="small">
                Have an account? <Link to="/login">Login</Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
