export type ThemeMode = "light" | "dark" | "system";

export interface Prefs {
  mode: ThemeMode;
  accent: string;
  textScale: number;
  reduceMotion: "system" | "on" | "off";
}

const KEY = "agrogram.prefs.v1"; // только настройки интерфейса, никаких секретов

export const DEFAULT_PREFS: Prefs = {
  mode: "system",
  accent: "#2E7D5B",
  textScale: 1,
  reduceMotion: "system",
};

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* хранилище недоступно: настройки действуют до перезагрузки */
  }
}

export function applyPrefs(p: Prefs) {
  const root = document.documentElement;
  const dark =
    p.mode === "dark" ||
    (p.mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme = dark ? "dark" : "light";
  root.style.setProperty("--accent", p.accent);
  root.style.setProperty("--text-scale", String(p.textScale));
  const reduce =
    p.reduceMotion === "on" ||
    (p.reduceMotion === "system" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  root.dataset.reduceMotion = reduce ? "true" : "false";
}

export function initTheme() {
  applyPrefs(loadPrefs());
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => applyPrefs(loadPrefs()));
}
