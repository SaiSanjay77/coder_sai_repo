"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client";

export type FontSize = "normal" | "large" | "extra-large";
export type Language = "en" | "ta";

interface AccessibilitySettings {
  fontSize: FontSize;
  highContrast: boolean;
  language: Language;
}

interface AccessibilityContextType extends AccessibilitySettings {
  setFontSize: (size: FontSize) => void;
  setHighContrast: (enabled: boolean) => void;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: "normal",
  highContrast: false,
  language: "en",
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
  undefined
);

const STORAGE_KEY = "bridge-gap-accessibility";

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  // Load settings from localStorage and Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      // First, try localStorage for immediate display
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSettings(parsed);
          applySettings(parsed);
        } catch (e) {
          console.error("Failed to parse stored settings:", e);
        }
      }

      // Then, try to get user settings from Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data: profile } = await supabase
            .from("profiles")
            .select("context_data")
            .eq("id", user.id)
            .single();

          if (profile?.context_data?.accessibility) {
            const cloudSettings = profile.context_data.accessibility as AccessibilitySettings;
            setSettings(cloudSettings);
            applySettings(cloudSettings);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudSettings));
          }
        }
      } catch (e) {
        console.error("Failed to load cloud settings:", e);
      }

      setIsLoading(false);
    };

    loadSettings();
  }, [supabase]);

  // Apply settings to DOM
  const applySettings = useCallback((s: AccessibilitySettings) => {
    document.body.setAttribute("data-font", s.fontSize);
    document.body.setAttribute("data-high-contrast", String(s.highContrast));
    document.body.setAttribute("data-language", s.language);
  }, []);

  // Save settings to localStorage and Supabase
  const saveSettings = useCallback(
    async (newSettings: AccessibilitySettings) => {
      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      applySettings(newSettings);

      // Save to Supabase if user is logged in
      if (userId) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("context_data")
            .eq("id", userId)
            .single();

          const currentContextData = profile?.context_data || {};
          const updatedContextData = {
            ...currentContextData,
            accessibility: newSettings,
          };

          await supabase
            .from("profiles")
            .update({ context_data: updatedContextData })
            .eq("id", userId);
        } catch (e) {
          console.error("Failed to save to cloud:", e);
        }
      }
    },
    [userId, supabase, applySettings]
  );

  const setFontSize = useCallback(
    (size: FontSize) => {
      const newSettings = { ...settings, fontSize: size };
      setSettings(newSettings);
      saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  const setHighContrast = useCallback(
    (enabled: boolean) => {
      const newSettings = { ...settings, highContrast: enabled };
      setSettings(newSettings);
      saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  const setLanguage = useCallback(
    (lang: Language) => {
      const newSettings = { ...settings, language: lang };
      setSettings(newSettings);
      saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        setFontSize,
        setHighContrast,
        setLanguage,
        isLoading,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
}

// Translation helper
export const translations = {
  en: {
    // Common
    home: "Home",
    settings: "Settings",
    logout: "Sign Out",
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    
    // Senior Dashboard
    hello: "Hello!",
    whatToDo: "What would you like to do today?",
    needHelp: "I Need Help",
    imLost: "I'm Lost / SOS",
    practiceUPI: "Practice UPI",
    learnPayments: "Learn Payments",
    scamCheck: "Scam Check",
    isSafe: "Is This Safe?",
    videoCall: "Video Call",
    talkToBuddy: "Talk to a Buddy",
    helpOnWay: "Help is Coming!",
    stayCalmBuddy: "Stay calm. A buddy will contact you very soon.",
    
    // Settings
    accessibility: "Accessibility",
    biggerText: "Bigger Text",
    biggerTextDesc: "Make all text larger and easier to read",
    highContrast: "High Contrast",
    highContrastDesc: "Black background with yellow text",
    language: "Language",
    languageDesc: "Choose your preferred language",
    english: "English",
    tamil: "தமிழ்",
    
    // UPI
    enterAmount: "Enter Amount",
    pay: "Pay",
    practiceMode: "Practice Mode",
    practiceModeDesc: "This is just for practice. No real money will be sent.",
    enterPin: "Enter Your PIN",
    paymentSuccess: "Payment Successful!",
    tryAgain: "Try Again",
    
    // Scam Check
    checkMessage: "Check a Message",
    pasteMessage: "Paste the message here...",
    analyze: "Analyze",
    safe: "Safe",
    danger: "Danger!",
    analyzing: "Analyzing...",
  },
  ta: {
    // Common
    home: "முகப்பு",
    settings: "அமைப்புகள்",
    logout: "வெளியேறு",
    back: "பின்",
    save: "சேமி",
    cancel: "ரத்து",
    
    // Senior Dashboard
    hello: "வணக்கம்!",
    whatToDo: "இன்று என்ன செய்ய விரும்புகிறீர்கள்?",
    needHelp: "உதவி வேண்டும்",
    imLost: "SOS உதவி",
    practiceUPI: "UPI பயிற்சி",
    learnPayments: "பணம் செலுத்த கற்றுக்கொள்",
    scamCheck: "மோசடி சோதனை",
    isSafe: "இது பாதுகாப்பானதா?",
    videoCall: "வீடியோ அழைப்பு",
    talkToBuddy: "உதவியாளரிடம் பேசு",
    helpOnWay: "உதவி வருகிறது!",
    stayCalmBuddy: "அமைதியாக இருங்கள். ஒரு உதவியாளர் விரைவில் தொடர்பு கொள்வார்.",
    
    // Settings
    accessibility: "அணுகல்தன்மை",
    biggerText: "பெரிய எழுத்து",
    biggerTextDesc: "எல்லா எழுத்துக்களையும் பெரிதாக்கு",
    highContrast: "உயர் மாறுபாடு",
    highContrastDesc: "கருப்பு பின்னணியில் மஞ்சள் எழுத்து",
    language: "மொழி",
    languageDesc: "உங்கள் விருப்பமான மொழியை தேர்வு செய்யவும்",
    english: "English",
    tamil: "தமிழ்",
    
    // UPI
    enterAmount: "தொகையை உள்ளிடவும்",
    pay: "செலுத்து",
    practiceMode: "பயிற்சி முறை",
    practiceModeDesc: "இது பயிற்சிக்காக மட்டுமே. உண்மையான பணம் அனுப்பப்படாது.",
    enterPin: "உங்கள் PIN-ஐ உள்ளிடவும்",
    paymentSuccess: "பணம் செலுத்தப்பட்டது!",
    tryAgain: "மீண்டும் முயற்சி",
    
    // Scam Check
    checkMessage: "செய்தியை சரிபார்",
    pasteMessage: "செய்தியை இங்கே ஒட்டவும்...",
    analyze: "பகுப்பாய்வு",
    safe: "பாதுகாப்பானது",
    danger: "ஆபத்து!",
    analyzing: "பகுப்பாய்வு செய்கிறது...",
  },
};

export function useTranslation() {
  const { language } = useAccessibility();
  
  const t = useCallback(
    (key: keyof typeof translations.en): string => {
      return translations[language][key] || translations.en[key] || key;
    },
    [language]
  );
  
  return { t, language };
}
