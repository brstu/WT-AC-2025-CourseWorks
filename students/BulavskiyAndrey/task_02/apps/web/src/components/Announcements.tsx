import { useEffect, useState } from "react";
import { api } from "../api";
import type { Announcement } from "../types";

export function Announcements({ groupId }: { groupId: string }) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ title: "", content: "" });

  const load = () =>
    api.getAnnouncements(groupId).then((r) => setItems(r.data.data)).catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.title || !form.content) return;
    await api.createAnnouncement(groupId, form);
    setForm({ title: "", content: "" });
    load();
  };

  return (
    <section>
      <h2>Объявления</h2>
      <div className="form-inline">
        <input
          placeholder="Заголовок"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="Текст"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <button onClick={create}>Создать</button>
      </div>
      <ul>
        {items.map((a) => (
          <li key={a.id}>
            <strong>{a.title}</strong> — {a.content}
          </li>
        ))}
      </ul>
    </section>
  );
}


