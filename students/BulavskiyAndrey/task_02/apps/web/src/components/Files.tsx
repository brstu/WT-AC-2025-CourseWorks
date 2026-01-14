import { useEffect, useState } from "react";
import { api } from "../api";
import type { File as FileItem } from "../types";

export function Files({ groupId }: { groupId: string }) {
  const [items, setItems] = useState<FileItem[]>([]);
  const [form, setForm] = useState({ name: "", size: 0, mime: "application/pdf" });

  const load = () =>
    api.getFiles(groupId).then((r) => setItems(r.data.data)).catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.name || form.size <= 0) return;
    await api.uploadFile(groupId, {
      name: form.name,
      fileSize: Number(form.size),
      mimeType: form.mime
    });
    setForm({ name: "", size: 0, mime: "application/pdf" });
    load();
  };

  const remove = async (id: string) => {
    await api.deleteFile(groupId, id);
    load();
  };

  return (
    <section>
      <h2>Файлы</h2>
      <div className="form-inline">
        <input
          placeholder="Имя файла"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Размер байт"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: Number(e.target.value) })}
        />
        <select value={form.mime} onChange={(e) => setForm({ ...form, mime: e.target.value })}>
          <option value="application/pdf">pdf</option>
          <option value="image/png">png</option>
          <option value="image/jpeg">jpg</option>
        </select>
        <button onClick={create}>Добавить</button>
      </div>
      <ul>
        {items.map((f) => (
          <li key={f.id}>
            {f.name} ({f.mimeType}, {f.fileSize}b){" "}
            <button onClick={() => remove(f.id)}>Удалить</button>
          </li>
        ))}
      </ul>
    </section>
  );
}


