import type { CapacitorConfig } from "@capacitor/cli";

// Упаковка веб-сборки (dist/) в Android-приложение.
const config: CapacitorConfig = {
  appId: "app.agrogram.client",
  appName: "AgroGram",
  webDir: "dist",
  android: {
    allowMixedContent: false,
  },
  plugins: {
    Keyboard: { resize: "native", resizeOnFullScreen: true },
  },
};

export default config;
