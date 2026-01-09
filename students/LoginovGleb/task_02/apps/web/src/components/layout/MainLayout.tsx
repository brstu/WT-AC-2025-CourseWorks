import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const MainLayout: React.FC = () => {
  return (
    <div className="layout">
      <Header />
      <main className="layout-main">
        <div className="layout-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
