import { useEffect, useState } from "react";
import { api } from "../api";
import type { Chat, Message } from "../types";

export function Chats({ groupId }: { groupId: string }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [newChat, setNewChat] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const loadChats = () =>
    api.getChats(groupId).then((r) => setChats(r.data.data)).catch(() => setChats([]));

  const loadMessages = (chatId: string) =>
    api.getMessages(groupId, chatId).then((r) => setMessages(r.data.data)).catch(() => setMessages([]));

  useEffect(() => {
    loadChats();
  }, []);

  const createChat = async () => {
    if (!newChat) return;
    await api.createChat(groupId, { title: newChat, type: "group" });
    setNewChat("");
    loadChats();
  };

  const send = async () => {
    if (!selected || !newMessage) return;
    await api.sendMessage(groupId, selected, { content: newMessage });
    setNewMessage("");
    loadMessages(selected);
  };

  return (
    <section>
      <h2>Чаты</h2>
      <div className="form-inline">
        <input
          placeholder="Название чата"
          value={newChat}
          onChange={(e) => setNewChat(e.target.value)}
        />
        <button onClick={createChat}>Создать</button>
      </div>
      <div className="chat-grid">
        <div>
          <h3>Список чатов</h3>
          <ul>
            {chats.map((c) => (
              <li key={c.id}>
                <button
                  className={selected === c.id ? "link active" : "link"}
                  onClick={() => {
                    setSelected(c.id);
                    loadMessages(c.id);
                  }}
                >
                  {c.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Сообщения</h3>
          {selected ? (
            <>
              <div className="form-inline">
                <input
                  placeholder="Текст сообщения"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={send}>Отправить</button>
              </div>
              <ul>
                {messages.map((m) => (
                  <li key={m.id}>{m.content}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>Выберите чат</p>
          )}
        </div>
      </div>
    </section>
  );
}


