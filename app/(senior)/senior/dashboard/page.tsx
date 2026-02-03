"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Smartphone, Shield, Video, Check, Pill } from "lucide-react";
import { createHelpRequest } from "../../actions";
import { useTranslation } from "@/components/providers/accessibility-provider";

export default function SeniorDashboard() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { t, language } = useTranslation();

  const handleSOS = () => {
    startTransition(async () => {
      const result = await createHelpRequest();
      if (result.success) {
        setShowSuccess(true);
        // Play success sound
        if (typeof window !== "undefined") {
          const message = language === "ta" 
            ? "உதவி வருகிறது! அமைதியாக இருங்கள். ஒரு உதவியாளர் விரைவில் தொடர்பு கொள்வார்."
            : "Help is on the way! Stay calm. A buddy will contact you soon.";
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 0.8;
          window.speechSynthesis.speak(utterance);
        }
        // Hide after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
      }
    });
  };

  // Success Overlay
  if (showSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-green-500 flex flex-col items-center justify-center z-[100] p-8"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-white rounded-full p-8 mb-8 shadow-2xl"
        >
          <Check className="h-32 w-32 text-green-500" strokeWidth={3} />
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold text-white text-center mb-4"
        >
          {t("helpOnWay")}
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl text-white/90 text-center max-w-md"
        >
          {t("stayCalmBuddy")}
        </motion.p>
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSuccess(false)}
          className="mt-8 bg-white/20 text-white px-8 py-4 rounded-2xl text-xl hover:bg-white/30 transition"
        >
          {t("back")}
        </motion.button>
      </motion.div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    })
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Greeting */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 speak-hover"
        data-speak-text={language === "ta" 
          ? "வணக்கம்! இன்று என்ன செய்ய விரும்புகிறீர்கள்?"
          : "Welcome! What would you like to do today?"
        }
      >
        <h2 className="text-3xl font-bold text-stone-800 mb-2">
          {t("hello")} 👋
        </h2>
        <p className="text-xl text-stone-600">
          {t("whatToDo")}
        </p>
      </motion.div>

      {/* 2x2 Grid of Massive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card A: SOS / I'm Lost (Red) */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card 
            className="h-[300px] bg-gradient-to-br from-red-500 to-red-600 border-none cursor-pointer shadow-xl speak-hover scale-hover"
            onClick={handleSOS}
            data-speak-text={language === "ta" 
              ? "அவசர உதவி பொத்தான். உடனடி உதவி தேவைப்பட்டால் இதை அழுத்தவும்."
              : "Emergency help button. Press this if you need immediate assistance."
            }
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8">
              <AlertTriangle className="h-24 w-24 text-white mb-4" strokeWidth={2.5} />
              <h3 className="text-3xl font-bold text-white text-center">
                {isPending ? "..." : t("needHelp")}
              </h3>
              <p className="text-lg text-white/80 mt-2 text-center">
                {t("imLost")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card B: Practice UPI (Blue) */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Link href="/senior/tools/upi">
            <Card 
              className="h-[300px] bg-gradient-to-br from-blue-500 to-blue-600 border-none cursor-pointer shadow-xl speak-hover scale-hover"
              data-speak-text={language === "ta" 
                ? "UPI பயிற்சி. GPay மற்றும் பிற கட்டண பயன்பாடுகளை பாதுகாப்பாக பயன்படுத்த கற்றுக்கொள்ளுங்கள்."
                : "Practice UPI payments. Learn how to use GPay and other payment apps safely."
              }
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-8">
                <Smartphone className="h-24 w-24 text-white mb-4" strokeWidth={2} />
                <h3 className="text-3xl font-bold text-white text-center">
                  {t("practiceUPI")}
                </h3>
                <p className="text-lg text-white/80 mt-2 text-center">
                  {t("learnPayments")}
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Card C: Check Scam (Yellow) */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Link href="/senior/tools/scam">
            <Card 
              className="h-[300px] bg-gradient-to-br from-amber-400 to-amber-500 border-none cursor-pointer shadow-xl speak-hover scale-hover"
              data-speak-text={language === "ta" 
                ? "மோசடி சோதனை. எந்த செய்தியும் மோசடியா என்று கண்டறிய ஒட்டவும்."
                : "Check for scams. Paste any message to find out if it's a scam."
              }
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-8">
                <Shield className="h-24 w-24 text-white mb-4" strokeWidth={2} />
                <h3 className="text-3xl font-bold text-white text-center">
                  {t("scamCheck")}
                </h3>
                <p className="text-lg text-white/80 mt-2 text-center">
                  {t("isSafe")}
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Card D: Video Call (Green) */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Link href="/senior/call">
            <Card 
              className="h-[300px] bg-gradient-to-br from-green-500 to-green-600 border-none cursor-pointer shadow-xl speak-hover scale-hover"
              data-speak-text={language === "ta" 
                ? "வீடியோ அழைப்பு. நேரடி உதவிக்கு உதவியாளருடன் இணையுங்கள்."
                : "Video call. Connect with a buddy for live help."
              }
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-8">
                <Video className="h-24 w-24 text-white mb-4" strokeWidth={2} />
                <h3 className="text-3xl font-bold text-white text-center">
                  {t("videoCall")}
                </h3>
                <p className="text-lg text-white/80 mt-2 text-center">
                  {t("talkToBuddy")}
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Card E: Medicine Reminders (Purple) */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="md:col-span-2"
        >
          <Link href="/senior/tools/medicine">
            <Card 
              className="h-[300px] bg-gradient-to-br from-purple-500 to-purple-600 border-none cursor-pointer shadow-xl speak-hover scale-hover"
              data-speak-text={language === "ta" 
                ? "மருந்து நினைவூட்டல். உங்கள் மருந்துகளை சரியான நேரத்தில் எடுக்க நினைவூட்டல்களை அமைக்கவும்."
                : "Medicine reminders. Set reminders to take your medicines on time."
              }
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-8">
                <Pill className="h-24 w-24 text-white mb-4" strokeWidth={2} />
                <h3 className="text-3xl font-bold text-white text-center">
                  {language === "ta" ? "மருந்து நினைவூட்டல்" : "Medicine Reminders"}
                </h3>
                <p className="text-lg text-white/80 mt-2 text-center">
                  {language === "ta" ? "மறக்காமல் மருந்து எடுங்கள்" : "Never miss a dose"}
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
