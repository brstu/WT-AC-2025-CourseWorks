import React from "react";

export function PageLayout({
  title,
  subtitle,
  headerRight,
  children,
}: {
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="container">
      <div className="page-header">
        <div className="page-title">
          <h1>{title}</h1>
          {subtitle ? <div className="subtle">{subtitle}</div> : null}
        </div>
        {headerRight ? <div className="nav">{headerRight}</div> : null}
      </div>

      <div className="section">{children}</div>
    </div>
  );
}
