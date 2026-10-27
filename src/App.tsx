import { useEffect, useState } from "react";
import {
  gateway,
  gatewayConfigured,
  GatewayClientError,
  type AuthStep,
} from "./api/gateway";
import { AuthScreen } from "./screens/AuthScreen";
import { ChatsScreen } from "./screens/ChatsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

type View = "loading" | "not_configured" | "error" | "auth" | "chats";

export function App() {
  const [view, setView] = useState<View>("loading");
  const [authStep, setAuthStep] = useState<AuthStep>("wait_phone");
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const check = async () => {
    setView("loading");
    setError(null);
    if (!gatewayConfigured) return setView("not_configured");
    try {
      const s = await gateway.authState();
      if (s.step === "ready") return setView("chats");
      setAuthStep(s.step);
      setView("auth");
    } catch (e) {
      if (e instanceof GatewayClientError && e.info.kind === "not_configured") {
        setView("not_configured");
      } else if (e instanceof GatewayClientError && e.info.kind === "unauthorized") {
        setAuthStep("wait_phone");
        setView("auth");
      } else {
        setError("Не удалось связаться с сервером. Проверьте соединение и повторите.");
        setView("error");
      }
    }
  };

  useEffect(() => {
    void check();
  }, []);

  if (showSettings) return <SettingsScreen onBack={() => setShowSettings(false)} />;

  switch (view) {
    case "loading":
      return <Skeleton />;
    case "not_configured":
      return (
        <Status
          title="Сервер не настроен"
          text="Укажите адрес gateway в переменной VITE_GATEWAY_URL (см. .env.example и README). Без gateway войти в Telegram нельзя."
        />
      );
    case "error":
      return (
        <Status
          title="Ошибка соединения"
          text={error ?? ""}
          action={{ label: "Повторить", run: check }}
        />
      );
    case "auth":
      return (
        <AuthScreen
          initialStep={authStep}
          onAuthorized={() => setView("chats")}
          onOpenSettings={() => setShowSettings(true)}
        />
      );
    case "chats":
      return (
        <ChatsScreen
          onOpenSettings={() => setShowSettings(true)}
          onSessionExpired={() => setView("auth")}
        />
      );
  }
}

function Skeleton() {
  return (
    <div className="center" aria-busy="true" aria-label="Загрузка">
      <div className="skeleton-col">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-row" />
        ))}
      </div>
    </div>
  );
}

function Status(props: {
  title: string;
  text: string;
  action?: { label: string; run: () => void };
}) {
  return (
    <div className="center">
      <div className="card status">
        <h1>{props.title}</h1>
        <p>{props.text}</p>
        {props.action && (
          <button className="btn filled" onClick={props.action.run}>
            {props.action.label}
          </button>
        )}
      </div>
    </div>
  );
}
