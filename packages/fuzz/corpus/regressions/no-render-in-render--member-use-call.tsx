// rule: no-render-in-render
// weakness: library-idiom
// source: fuzz session 2026-07-08 (adversarial edge-case audit: i18n.use /
//         app.use member calls matched getCalleeName + isReactHookName)
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const renderLocalizedBadge = (label: string) => {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({ fallbackLng: "en" });
  }
  return <span className="badge">{i18n.t(label)}</span>;
};

export function StatusBar({ label }: { label: string }) {
  return <footer>{renderLocalizedBadge(label)}</footer>;
}
