"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type Language = "en" | "ta";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "bridge-gap-language";

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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load persisted language
    const stored = localStorage.getItem(STORAGE_KEY) as Language;
    if (stored && (stored === "en" || stored === "ta")) {
      setLanguageState(stored);
      document.body.setAttribute("data-language", stored);
    }
    setIsLoaded(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.body.setAttribute("data-language", lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      // @ts-ignore - dynamic key access
      return translations[language][key] || translations.en[key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
