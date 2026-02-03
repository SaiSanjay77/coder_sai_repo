"use client";

import { useAccessibility } from "@/components/providers/accessibility-provider";

export function LanguageToggle() {
  const { language, setLanguage } = useAccessibility();

  return (
    <div className="flex items-center gap-2 bg-white/80 border border-stone-200 rounded-full px-3 py-2 shadow-sm">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`text-sm font-semibold px-3 py-1 rounded-full transition ${
          language === "en"
            ? "bg-amber-500 text-white"
            : "text-stone-600 hover:text-stone-800"
        }`}
      >
        English
      </button>
      <span className="text-stone-300">|</span>
      <button
        type="button"
        onClick={() => setLanguage("ta")}
        className={`text-sm font-semibold px-3 py-1 rounded-full transition ${
          language === "ta"
            ? "bg-amber-500 text-white"
            : "text-stone-600 hover:text-stone-800"
        }`}
      >
        தமிழ்
      </button>
    </div>
  );
}
