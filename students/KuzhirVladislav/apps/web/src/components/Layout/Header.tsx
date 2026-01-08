import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import logo from '../../assets/logo.svg'

export default function Header(){
  const auth = useAuth()
  const nav = useNavigate()
  const [q,setQ] = useState('')

  const doSearch = () => {
    const s = q.trim()
    if(!s) return
    nav(`/clients?search=${encodeURIComponent(s)}`)
  }

  return (
    <header className="header">
      <div className="logo-wrap">
        <img src={logo} className="logo-img" alt="logo" />
        <div>
          <div className="logo-title">Фриланс без паники</div>
          <div className="small">Мини‑CRM</div>
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div className="search-box">
          <input className="search-input" placeholder="Поиск: клиенты, сделки, задачи" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') doSearch() }} />
          <button className="search-btn" onClick={doSearch}>🔍</button>
        </div>
      </div>
    </header>
  )
}
