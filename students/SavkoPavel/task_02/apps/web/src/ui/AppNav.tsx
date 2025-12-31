import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { ThemeToggle } from "./ThemeToggle";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const loc = useLocation();
  const active = loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to + "/"));

  return (
    <Link to={to} className={active ? "pill" : undefined}>
      {children}
    </Link>
  );
}

export function AppNav() {
  const auth = useAuth();
  const role = auth.payload?.role;

  return (
    <>
      {role ? <NavLink to="/incidents">Incidents</NavLink> : null}
      {role === "ADMIN" ? <NavLink to="/queues">Queues</NavLink> : null}
      {role === "ADMIN" ? <NavLink to="/users">Users</NavLink> : null}
      {role === "ADMIN" || role === "AGENT" ? <NavLink to="/sla">SLA</NavLink> : null}
      {role === "AGENT" ? <NavLink to="/my-queues">My queues</NavLink> : null}
      {role ? <NavLink to="/me">Me</NavLink> : null}

      <ThemeToggle />

      {role ? (
        <button type="button" className="btn" onClick={() => auth.logout()}>
          Logout
        </button>
      ) : null}
    </>
  );
}
