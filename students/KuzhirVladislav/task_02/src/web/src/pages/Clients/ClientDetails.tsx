import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/clients";
import { Client } from "../../types/models";

export default function ClientDetails() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get(id)
      .then((r) => setClient(r))
      .catch(() => {});
  }, [id]);

  if (!client) return <div className="card">Загрузка...</div>;

  return (
    <div>
      <h1>{client.name}</h1>
      <div className="card">
        <div>Email: {client.email}</div>
        <div>Телефон: {client.phone}</div>
        <div>Создан: {client.createdAt}</div>
      </div>
    </div>
  );
}
