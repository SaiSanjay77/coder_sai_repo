"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function BuddyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error("Buddy section error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center"
            >
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </motion.div>
            <CardTitle className="text-2xl text-white">
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-400">
              An unexpected error occurred. This has been logged for review.
            </p>

            {/* Error digest for support (optional) */}
            {error.digest && (
              <p className="text-xs text-slate-500 font-mono bg-slate-900 p-2 rounded">
                Error ID: {error.digest}
              </p>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={reset}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>

              <Link href="/buddy/dashboard" className="w-full">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
