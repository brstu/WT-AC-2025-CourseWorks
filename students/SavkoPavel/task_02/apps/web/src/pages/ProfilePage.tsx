import React, { useMemo } from "react";
import { useAuth } from "../lib/AuthProvider";
import { AppNav } from "../ui/AppNav";
import { PageLayout } from "../ui/PageLayout";

export function ProfilePage() {
  const auth = useAuth();
  const payload = auth.payload;

  const expText = useMemo(() => {
    if (!payload?.exp) return "-";
    return new Date(payload.exp * 1000).toLocaleString();
  }, [payload?.exp]);

  const iatText = useMemo(() => {
    if (!payload?.iat) return "-";
    return new Date(payload.iat * 1000).toLocaleString();
  }, [payload?.iat]);

  return (
    <PageLayout title="My profile" subtitle="From JWT payload" headerRight={<AppNav />}>
      <div className="card">
        <div className="stack">
          <div>
            <div className="small">userId</div>
            <div style={{ fontWeight: 800 }}>{payload?.userId ?? "-"}</div>
          </div>
          <div>
            <div className="small">role</div>
            <div style={{ fontWeight: 800 }}>{payload?.role ?? "-"}</div>
          </div>
          <div>
            <div className="small">iat</div>
            <div style={{ fontWeight: 800 }}>{iatText}</div>
          </div>
          <div>
            <div className="small">exp</div>
            <div style={{ fontWeight: 800 }}>{expText}</div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
