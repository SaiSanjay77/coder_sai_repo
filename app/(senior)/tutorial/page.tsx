"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AudioGuide } from "@/components/audio-guide";
import { useLanguage } from "@/components/providers/language-provider";
import { AlertCircle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    color: "bg-rose-500",
    icon: <AlertCircle className="w-20 h-20 text-white" />,
    title: { en: "Red means STOP", ta: "சிவப்பு என்றால் நில்" },
    body: { 
      en: "This color is for danger or deleting things. Be careful when you see red buttons.", 
      ta: "இந்த நிறம் ஆபத்து அல்லது நீக்குவதற்கு. சிவப்பு பொத்தான்களைப் பார்க்கும்போது கவனமாக இருங்கள்." 
    },
  },
  {
    color: "bg-blue-500",
    icon: <Info className="w-20 h-20 text-white" />,
    title: { en: "Blue means INFO", ta: "நீலம் என்றால் தகவல்" },
    body: { 
      en: "Blue buttons give you help or information. It is safe to tap them.", 
      ta: "நீல பொத்தான்கள் உங்களுக்கு உதவி அல்லது தகவலைத் தரும். அவற்றை அழுத்துவது பாதுகாப்பானது." 
    },
  },
  {
    color: "bg-emerald-500",
    icon: <CheckCircle className="w-20 h-20 text-white" />,
    title: { en: "Green means GO", ta: "பச்சை என்றால் செல்" },
    body: { 
      en: "Green buttons mean 'Yes' or 'Continue'. Use these to move forward.", 
      ta: "பச்சை பொத்தான்கள் 'ஆம்' அல்லது 'தொடரவும்' என்று அர்த்தம். முன்னேற இதைப் பயன்படுத்தவும்." 
    },
  },
];

export default function SeniorTutorialPage() {
  const [step, setStep] = useState(0);
  const { language } = useLanguage();

  const currentSlide = slides[step];
  const isLast = step === slides.length - 1;

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Use a small timeout to ensure the state update has visual priority
    const timer = setTimeout(() => {
      window.speechSynthesis.cancel();
      const text = `${currentSlide.title[language]}... ${currentSlide.body[language]}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "ta" ? "ta-IN" : "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }, 500);

    return () => clearTimeout(timer);
  }, [step, language, currentSlide]);

  return (
    <AudioGuide>
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[70vh] md:h-auto md:aspect-[3/4]">
          
          {/* Top colored section */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className={`flex-1 m-4 rounded-2xl flex items-center justify-center shadow-inner ${currentSlide.color}`}
            >
              <div className="flex flex-col items-center gap-4 p-6 text-center">
                {currentSlide.icon}
                <h2 className="text-3xl font-bold text-white drop-shadow-md">
                  {currentSlide.title[language]}
                </h2>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom content section */}
          <div className="p-8 flex flex-col gap-6 items-center text-center">
            <p className="text-xl text-stone-600 font-medium min-h-[5rem]">
              {currentSlide.body[language]}
            </p>

            <div className="w-full flex gap-4 mt-auto">
              {step > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(s => s - 1)}
                  className="flex-1 text-lg h-14 rounded-2xl border-stone-200"
                >
                  ← Back
                </Button>
              )}
              
              {!isLast ? (
                <Button
                  size="lg"
                  onClick={() => setStep(s => s + 1)}
                  className="flex-1 text-lg h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Next →
                </Button>
              ) : (
                <Link href="/signup" className="flex-1">
                  <Button
                    size="lg"
                    className="w-full text-lg h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse"
                  >
                    Finish
                  </Button>
                </Link>
              )}
            </div>
            
            <Link 
              href="/signup?skip=true" 
              className="text-stone-400 text-sm font-semibold py-2"
            >
              Skip Tutorial
            </Link>
          </div>
        </div>
        
        {/* Progress Dots */}
        <div className="flex gap-2 mt-8">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full transition-colors ${
                i === step ? "bg-amber-500" : "bg-stone-300"
              }`} 
            />
          ))}
        </div>
      </div>
    </AudioGuide>
  );
}
