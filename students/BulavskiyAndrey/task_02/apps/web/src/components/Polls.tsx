import { useEffect, useState } from "react";
import { api } from "../api";
import type { Poll } from "../types";

export function Polls({ groupId }: { groupId: string }) {
  const [items, setItems] = useState<Poll[]>([]);
  const [form, setForm] = useState({ question: "", choice1: "", choice2: "" });

  const load = () =>
    api.getPolls(groupId).then((r) => setItems(r.data.data)).catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.question || !form.choice1 || !form.choice2) return;
    await api.createPoll(groupId, {
      question: form.question,
      choices: [{ text: form.choice1 }, { text: form.choice2 }]
    });
    setForm({ question: "", choice1: "", choice2: "" });
    load();
  };

  const vote = async (pollId: string, choiceId: string) => {
    await api.vote(groupId, pollId, [choiceId]);
    load();
  };

  return (
    <section>
      <h2>Опросы</h2>
      <div className="form-inline">
        <input
          placeholder="Вопрос"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
        />
        <input
          placeholder="Вариант 1"
          value={form.choice1}
          onChange={(e) => setForm({ ...form, choice1: e.target.value })}
        />
        <input
          placeholder="Вариант 2"
          value={form.choice2}
          onChange={(e) => setForm({ ...form, choice2: e.target.value })}
        />
        <button onClick={create}>Создать</button>
      </div>
      <ul>
        {items.map((p) => (
          <li key={p.id}>
            <div>
              <strong>{p.question}</strong>
            </div>
            <ul>
              {p.choices?.map((c) => {
                const voteCount = (c as any).votes?.length ?? 0;
                return (
                  <li key={c.id}>
                    {c.text} — {voteCount} голосов{" "}
                    <button onClick={() => vote(p.id, c.id)}>Голосовать</button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}


