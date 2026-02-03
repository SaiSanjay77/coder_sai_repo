"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Home, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function SeniorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (not shown to user)
    console.error("Senior section error:", error);
  }, [error]);

  // Speak the error message
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(
        "Something went wrong. Don't worry, just press the Try Again button to fix it."
      );
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card className="border-2 border-amber-200 bg-amber-50 shadow-xl">
          <CardContent className="p-8 text-center">
            {/* Friendly Icon */}
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-6 h-24 w-24 bg-amber-100 rounded-full flex items-center justify-center"
            >
              <AlertCircle className="h-12 w-12 text-amber-600" />
            </motion.div>

            {/* Friendly Message */}
            <h1 className="text-3xl font-bold text-stone-800 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-xl text-stone-600 mb-8">
              Don't worry! This happens sometimes. Just press the button below to try again.
            </p>

            {/* Big Try Again Button */}
            <Button
              onClick={reset}
              size="lg"
              className="w-full h-20 text-2xl bg-green-500 hover:bg-green-600 text-white mb-4"
            >
              <RefreshCw className="mr-3 h-8 w-8" />
              Try Again
            </Button>

            {/* Go Home Option */}
            <Link href="/senior/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-16 text-xl"
              >
                <Home className="mr-3 h-6 w-6" />
                Go Home
              </Button>
            </Link>

            {/* Help Line */}
            <div className="mt-8 p-4 bg-white rounded-xl border border-amber-200">
              <p className="text-stone-600 flex items-center justify-center gap-2">
                <Phone className="h-5 w-5" />
                Need help? Call <span className="font-bold">1800-BRIDGE</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
