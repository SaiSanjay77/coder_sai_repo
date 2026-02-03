"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center max-w-md"
      >
        {/* Emoji */}
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, -10, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="text-8xl mb-6"
        >
          🔍
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-stone-800 mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-xl text-stone-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Helpful message for seniors */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <p className="text-amber-800 text-left">
              <strong>Don't worry!</strong> This sometimes happens. Click the button below to go back home safely.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/" className="block">
            <Button
              size="lg"
              className="w-full h-16 text-xl bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Home className="mr-3 h-6 w-6" />
              Go Home
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 text-lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-stone-500"
      >
        Need help? Call <span className="font-semibold">1800-BRIDGE</span>
      </motion.p>
    </div>
  );
}
