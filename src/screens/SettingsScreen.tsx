import { useState } from "react";
import { applyPrefs, loadPrefs, savePrefs, type Prefs, type ThemeMode } from "../theme";

const THEME_LABELS: Record<ThemeMode, string> = { system: "Системная", light: "Светлая", dark: "Тёмная" };

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);

  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePrefs(next);
    applyPrefs(next);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Назад">←</button>
        <h1>Настройки</h1>
      </header>
      <main className="settings">
        <section>
          <h2>Тема</h2>
          <div className="segmented" role="radiogroup" aria-label="Тема">
            {(["system", "light", "dark"] as ThemeMode[]).map((m) => (
              <button
                key={m}
                role="radio"
                aria-checked={prefs.mode === m}
                className={prefs.mode === m ? "seg active" : "seg"}
                onClick={() => update({ mode: m })}
              >
                {THEME_LABELS[m]}
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2>Акцентный цвет</h2>
          <input type="color" aria-label="Акцентный цвет" value={prefs.accent}
            onChange={(e) => update({ accent: e.target.value })} />
        </section>
        <section>
          <h2>Размер текста: {Math.round(prefs.textScale * 100)}%</h2>
          <input type="range" min={0.9} max={1.2} step={0.05} value={prefs.textScale}
            aria-label="Размер текста"
            onChange={(e) => update({ textScale: Number(e.target.value) })} />
        </section>
        <section>
          <h2>Анимации</h2>
          <select aria-label="Анимации" value={prefs.reduceMotion}
            onChange={(e) => update({ reduceMotion: e.target.value as Prefs["reduceMotion"] })}>
            <option value="system">Как в системе</option>
            <option value="off">Включены</option>
            <option value="on">Уменьшены</option>
          </select>
        </section>
        <section>
          <h2>Подключение</h2>
          <p className="muted">
            Gateway: {import.meta.env.VITE_GATEWAY_URL ? "адрес задан" : "не задан (VITE_GATEWAY_URL)"}
          </p>
        </section>
      </main>
    </div>
  );
}
