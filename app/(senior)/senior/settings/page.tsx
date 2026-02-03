"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Type, Sun, Globe, Check } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  useAccessibility,
  useTranslation,
  FontSize,
  Language,
} from "@/components/providers/accessibility-provider";

export default function SeniorSettingsPage() {
  const { fontSize, highContrast, language, setFontSize, setHighContrast, setLanguage } =
    useAccessibility();
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);

  const showSavedFeedback = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // Speak feedback
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance("Settings saved!");
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    showSavedFeedback();
  };

  const handleContrastChange = (enabled: boolean) => {
    setHighContrast(enabled);
    showSavedFeedback();
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    showSavedFeedback();
  };

  const fontSizes: { value: FontSize; label: string; labelTa: string; icon: string }[] = [
    { value: "normal", label: "Normal", labelTa: "சாதாரண", icon: "A" },
    { value: "large", label: "Large", labelTa: "பெரிய", icon: "A" },
    { value: "extra-large", label: "Extra Large", labelTa: "மிகப் பெரிய", icon: "A" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto pb-32"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/senior/dashboard"
          className="p-3 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-stone-700" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-stone-800">{t("settings")}</h1>
          <p className="text-stone-600">{t("accessibility")}</p>
        </div>
      </div>

      {/* Saved Notification */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-50"
        >
          <Check className="h-5 w-5" />
          <span className="font-semibold">Settings Saved!</span>
        </motion.div>
      )}

      <div className="space-y-8">
        {/* FONT SIZE SECTION */}
        <Card className="overflow-hidden border-2 border-stone-200">
          <CardContent className="p-0">
            <div className="bg-blue-50 p-6 border-b border-stone-200">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-500 rounded-2xl">
                  <Type className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-stone-800">{t("biggerText")}</h2>
                  <p className="text-stone-600">{t("biggerTextDesc")}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {fontSizes.map((size, index) => (
                <button
                  key={size.value}
                  onClick={() => handleFontSizeChange(size.value)}
                  className={`w-full p-6 rounded-2xl border-3 transition-all flex items-center justify-between ${
                    fontSize === size.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="font-bold text-stone-700"
                      style={{ fontSize: `${1 + index * 0.4}rem` }}
                    >
                      {size.icon}
                    </span>
                    <span className="text-xl font-semibold text-stone-800">
                      {language === "ta" ? size.labelTa : size.label}
                    </span>
                  </div>
                  {fontSize === size.value && (
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* HIGH CONTRAST SECTION */}
        <Card className="overflow-hidden border-2 border-stone-200">
          <CardContent className="p-0">
            <div className="bg-amber-50 p-6 border-b border-stone-200">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-500 rounded-2xl">
                  <Sun className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-stone-800">{t("highContrast")}</h2>
                  <p className="text-stone-600">{t("highContrastDesc")}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex gap-4">
                <button
                  onClick={() => handleContrastChange(false)}
                  className={`flex-1 p-6 rounded-2xl border-3 transition-all ${
                    !highContrast
                      ? "border-amber-500 bg-amber-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="h-16 w-full bg-white border-2 border-stone-200 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-stone-800 font-bold">Aa</span>
                  </div>
                  <span className="text-lg font-semibold text-stone-800">
                    {language === "ta" ? "இயல்பு" : "Normal"}
                  </span>
                  {!highContrast && (
                    <div className="mt-2 flex justify-center">
                      <Check className="h-6 w-6 text-amber-500" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleContrastChange(true)}
                  className={`flex-1 p-6 rounded-2xl border-3 transition-all ${
                    highContrast
                      ? "border-amber-500 bg-amber-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="h-16 w-full bg-black border-2 border-yellow-400 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-yellow-400 font-bold">Aa</span>
                  </div>
                  <span className="text-lg font-semibold text-stone-800">
                    {language === "ta" ? "உயர் மாறுபாடு" : "High Contrast"}
                  </span>
                  {highContrast && (
                    <div className="mt-2 flex justify-center">
                      <Check className="h-6 w-6 text-amber-500" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LANGUAGE SECTION */}
        <Card className="overflow-hidden border-2 border-stone-200">
          <CardContent className="p-0">
            <div className="bg-green-50 p-6 border-b border-stone-200">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-500 rounded-2xl">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-stone-800">{t("language")}</h2>
                  <p className="text-stone-600">{t("languageDesc")}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex gap-4">
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`flex-1 p-8 rounded-2xl border-3 transition-all ${
                    language === "en"
                      ? "border-green-500 bg-green-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="text-4xl mb-3">🇬🇧</div>
                  <span className="text-xl font-semibold text-stone-800">English</span>
                  {language === "en" && (
                    <div className="mt-3 flex justify-center">
                      <Check className="h-6 w-6 text-green-500" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleLanguageChange("ta")}
                  className={`flex-1 p-8 rounded-2xl border-3 transition-all ${
                    language === "ta"
                      ? "border-green-500 bg-green-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="text-4xl mb-3">🇮🇳</div>
                  <span className="text-xl font-semibold text-stone-800">தமிழ்</span>
                  {language === "ta" && (
                    <div className="mt-3 flex justify-center">
                      <Check className="h-6 w-6 text-green-500" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
