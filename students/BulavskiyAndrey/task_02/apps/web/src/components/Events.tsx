import { useEffect, useState } from "react";
import { api } from "../api";
import type { Event as EventItem } from "../types";

export function Events({ groupId }: { groupId: string }) {
  const [items, setItems] = useState<EventItem[]>([]);
  const [form, setForm] = useState({ title: "", startAt: "", type: "meeting" });

  const load = () =>
    api.getEvents(groupId).then((r) => setItems(r.data.data)).catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.title || !form.startAt) return;
    await api.createEvent(groupId, {
      title: form.title,
      startAt: form.startAt,
      type: form.type,
      description: ""
    });
    setForm({ title: "", startAt: "", type: "meeting" });
    load();
  };

  return (
    <section>
      <h2>Календарь</h2>
      <div className="form-inline">
        <input
          placeholder="Название"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="datetime-local"
          value={form.startAt}
          onChange={(e) => setForm({ ...form, startAt: e.target.value })}
        />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="lecture">lecture</option>
          <option value="deadline">deadline</option>
          <option value="exam">exam</option>
          <option value="meeting">meeting</option>
          <option value="other">other</option>
        </select>
        <button onClick={create}>Создать</button>
      </div>
      <ul>
        {items.map((ev) => (
          <li key={ev.id}>
            {ev.title} — {new Date(ev.startAt).toLocaleString()} ({ev.type})
          </li>
        ))}
      </ul>
    </section>
  );
}


