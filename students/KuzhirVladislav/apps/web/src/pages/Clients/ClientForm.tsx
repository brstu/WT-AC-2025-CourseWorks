import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/clients";
import { Client } from "../../types/models";
import FormField from "../../components/UI/FormField";

export default function ClientForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Имя обязательно";
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = "Неверный email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: Partial<Client> = { name: name.trim(), email: email.trim() };
      await api.create(payload);
      navigate("/clients");
    } catch (err: any) {
      setErrors({ _global: err?.message || "Ошибка сохранения" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Новый клиент</h1>
      <div className="card">
        <div className="form-row">
          <FormField
            label="Имя"
            name="name"
            value={name}
            onChange={(v) => setName(v)}
            placeholder="Имя"
            error={errors.name}
          />
          <FormField
            label="Email"
            name="email"
            value={email}
            onChange={(v) => setEmail(v)}
            placeholder="Email"
            error={errors.email}
          />
        </div>
        {errors._global && <div style={{ color: "tomato", marginTop: 8 }}>{errors._global}</div>}
        <div className="form-actions" style={{ marginTop: 12 }}>
          <button className="button" onClick={save} disabled={loading}>
            {loading ? "Сохраняю..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}
