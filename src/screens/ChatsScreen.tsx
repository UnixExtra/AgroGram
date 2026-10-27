import { useEffect, useState } from "react";
import { gateway, GatewayClientError, type ChatSummary } from "../api/gateway";

type State =
  | { kind: "loading" }
  | { kind: "ready"; chats: ChatSummary[] }
  | { kind: "error"; message: string };

interface Props {
  onOpenSettings: () => void;
  onSessionExpired: () => void;
}

export function ChatsScreen({ onOpenSettings, onSessionExpired }: Props) {
  const [state, setState] = useState<State>({ kind: "loading" });

  const load = async () => {
    setState({ kind: "loading" });
    try {
      const { chats } = await gateway.chats();
      setState({ kind: "ready", chats });
    } catch (e) {
      if (e instanceof GatewayClientError && e.info.kind === "unauthorized") return onSessionExpired();
      setState({ kind: "error", message: "Не удалось загрузить чаты. Проверьте соединение." });
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="logo small" aria-hidden>AG</div>
        <h1>Чаты</h1>
        <button className="icon-btn" onClick={onOpenSettings} aria-label="Настройки">⚙</button>
      </header>

      <main className="list" aria-live="polite">
        {state.kind === "loading" && (
          <div className="skeleton-col" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-row" />
            ))}
          </div>
        )}
        {state.kind === "error" && (
          <div className="empty">
            <p>{state.message}</p>
            <button className="btn filled" onClick={load}>Повторить</button>
          </div>
        )}
        {state.kind === "ready" && state.chats.length === 0 && (
          <div className="empty"><p>Чатов пока нет.</p></div>
        )}
        {state.kind === "ready" &&
          state.chats.map((c) => (
            <div key={c.id} className="chat-row">
              <div className="avatar" aria-hidden>{c.title.slice(0, 1).toUpperCase()}</div>
              <div className="chat-meta">
                <strong>{c.title}</strong>
                <span>{c.lastMessage ?? ""}</span>
              </div>
              {c.unread > 0 && <span className="badge">{c.unread}</span>}
            </div>
          ))}
      </main>
    </div>
  );
}
