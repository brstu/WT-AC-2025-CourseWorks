import React, { PropsWithChildren } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Sidebar />
      </aside>
      <main className="main">
        <Header />
        <div>{children}</div>
      </main>
    </div>
  )
}

