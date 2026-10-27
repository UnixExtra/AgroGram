import { useState } from "react";
import { gateway, GatewayClientError, type AuthStep } from "../api/gateway";

interface Props {
  initialStep: AuthStep;
  onAuthorized: () => void;
  onOpenSettings: () => void;
}

const PHONE_RE = /^\+[1-9]\d{6,14}$/;
const CODE_RE = /^\d{4,8}$/;

const LABELS: Record<string, { title: string; hint: string; type: string }> = {
  wait_phone: { title: "Вход в Telegram", hint: "Номер телефона", type: "tel" },
  wait_code: { title: "Код подтверждения", hint: "Код из Telegram", type: "text" },
  wait_password: { title: "Двухэтапная проверка", hint: "Пароль", type: "password" },
};

export function AuthScreen({ initialStep, onAuthorized, onOpenSettings }: Props) {
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = value.trim();
    if (step === "wait_phone" && !PHONE_RE.test(v))
      return setError("Введите номер в международном формате, например +79001234567");
    if (step === "wait_code" && !CODE_RE.test(v)) return setError("Код — от 4 до 8 цифр");
    if (step === "wait_password" && v.length === 0) return setError("Введите пароль");

    setBusy(true);
    try {
      const next =
        step === "wait_phone"
          ? await gateway.submitPhone(v)
          : step === "wait_code"
            ? await gateway.submitCode(v)
            : await gateway.submitPassword(v);
      setValue("");
      if (next.step === "ready") return onAuthorized();
      setStep(next.step);
    } catch (err) {
      setValue("");
      setError(
        err instanceof GatewayClientError && err.info.kind === "network"
          ? "Нет соединения с сервером"
          : "Telegram отклонил запрос. Проверьте данные и повторите.",
      );
    } finally {
      setBusy(false);
    }
  };

  const l = LABELS[step] ?? LABELS.wait_phone;

  return (
    <div className="center">
      <form className="card auth" onSubmit={submit}>
        <div className="logo" aria-hidden>AG</div>
        <h1>{l.title}</h1>
        <label className="field">
          <span>{l.hint}</span>
          <input
            type={l.type}
            autoComplete={step === "wait_password" ? "current-password" : "off"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={busy}
            autoFocus
          />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn filled" type="submit" disabled={busy}>
          {busy ? "Проверяем…" : "Далее"}
        </button>
        <button className="btn text" type="button" onClick={onOpenSettings}>
          Настройки
        </button>
      </form>
    </div>
  );
}
