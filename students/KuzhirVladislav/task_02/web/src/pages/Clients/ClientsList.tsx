import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Client } from "../../types/models";
import api from "../../api/clients";
import ClientModal from "../../components/ClientModal";
import Skeleton from "../../components/UI/Skeleton";

export default function ClientsList() {
  const [items, setItems] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const q = params.get("search") || "";

  useEffect(() => {
    loadClients();
  }, [q]);

  const loadClients = () => {
    setLoading(true);
    api
      .list(q ? { search: q } : undefined)
      .then((r) => {
        setItems(r);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleModalSave = (updatedClient: Client) => {
    setItems(items.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Клиенты</h1>
        <Link to="/clients/new">
          <button className="button">Создать</button>
        </Link>
      </div>
      {loading ? (
        <div className="card">
          <Skeleton rows={5} />
        </div>
      ) : (
        <div className="list">
          {items.length === 0 && <div className="card">Список пуст</div>}
          {items.map((c) => (
            <div key={c.id} className="item">
              <div>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={{ color: "var(--muted)" }}>{c.email || c.phone}</div>
              </div>
              <div>
                <button className="button" onClick={() => handleClientClick(c)}>
                  Открыть
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ClientModal
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        onDelete={loadClients}
      />
    </div>
  );
}
