"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface ScamResult {
  is_danger: boolean;
  reason_tamil: string;
  reason_english: string;
}

export default function ScamChecker() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<ScamResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkForScam = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/scam-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      });

      const data = await response.json();
      setResult(data);

      // Speak the result
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const speechText = data.is_danger
          ? `Warning! This message looks dangerous. ${data.reason_english}`
          : `This message looks safe. ${data.reason_english}`;
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Error checking scam:", error);
      setResult({
        is_danger: false,
        reason_tamil: "சேவை கிடைக்கவில்லை. பின்னர் முயற்சிக்கவும்.",
        reason_english: "Service unavailable. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetChecker = () => {
    setMessage("");
    setResult(null);
  };

  // ===== RESULT SCREEN =====
  if (result) {
    return (
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetChecker}
            className="h-12 w-12"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-stone-800">Scam Check Result</h1>
        </div>

        {/* Result Card - DANGER or SAFE */}
        <Card
          className={`mb-8 border-4 ${
            result.is_danger
              ? "bg-red-50 border-red-500"
              : "bg-green-50 border-green-500"
          }`}
        >
          <CardContent className="p-8 text-center">
            {result.is_danger ? (
              <>
                <div className="bg-red-500 rounded-full p-6 w-28 h-28 mx-auto mb-6 flex items-center justify-center">
                  <AlertTriangle className="h-14 w-14 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-red-600 mb-4">
                  ⚠️ DANGER - Possible Scam!
                </h2>
              </>
            ) : (
              <>
                <div className="bg-green-500 rounded-full p-6 w-28 h-28 mx-auto mb-6 flex items-center justify-center">
                  <CheckCircle2 className="h-14 w-14 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-green-600 mb-4">
                  ✅ Looks Safe
                </h2>
              </>
            )}

            {/* Explanation */}
            <div className="text-left space-y-4 mt-6">
              <div className="bg-white rounded-xl p-4 border">
                <p className="text-sm text-stone-500 mb-1">English:</p>
                <p className="text-lg text-stone-800">{result.reason_english}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border">
                <p className="text-sm text-stone-500 mb-1">தமிழ்:</p>
                <p className="text-lg text-stone-800">{result.reason_tamil}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={resetChecker}
            className="w-full h-16 text-xl bg-blue-500 hover:bg-blue-600"
          >
            Check Another Message
          </Button>
          
          <Link href="/senior/dashboard" className="block">
            <Button variant="outline" className="w-full h-14 text-lg">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Safety Tip for Danger */}
        {result.is_danger && (
          <div className="bg-amber-100 border-2 border-amber-300 rounded-xl p-4 mt-8">
            <p className="text-lg text-amber-800 text-center">
              💡 <strong>Tip:</strong> Never share OTP, PIN, or bank details with anyone!
            </p>
          </div>
        )}
      </div>
    );
  }

  // ===== INPUT SCREEN =====
  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/senior/dashboard">
          <Button variant="ghost" size="icon" className="h-12 w-12">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-stone-800">
          Check for Scam
        </h1>
      </div>

      {/* Shield Icon */}
      <div className="flex justify-center mb-8">
        <div className="bg-amber-100 rounded-full p-8">
          <Shield className="h-20 w-20 text-amber-600" />
        </div>
      </div>

      {/* Instructions */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <p className="text-xl text-stone-700 text-center">
            📋 Paste the suspicious message you received below. We&apos;ll check if it&apos;s a scam.
          </p>
        </CardContent>
      </Card>

      {/* Text Input */}
      <div className="mb-8">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste the message here...

Example: 'Your KYC has expired. Click this link to update...'"
          className="w-full h-52 p-5 text-xl border-2 border-stone-300 rounded-xl focus:border-amber-500 focus:outline-none resize-none"
        />
      </div>

      {/* Analyze Button */}
      <Button
        onClick={checkForScam}
        disabled={!message.trim() || isLoading}
        className="w-full h-20 text-2xl bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-3 h-7 w-7 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Shield className="mr-3 h-7 w-7" />
            Analyze Message
          </>
        )}
      </Button>

      {/* Example Scams */}
      <div className="mt-10">
        <p className="text-stone-600 mb-4 text-center font-medium">
          Tap an example to test:
        </p>
        <div className="space-y-3">
          {[
            "Your account will be blocked! Click link to verify KYC",
            "Congratulations! You won ₹50 lakhs lottery! Send ₹5000 to claim",
            "I am calling from SBI. Share your OTP to receive refund",
          ].map((example, i) => (
            <button
              key={i}
              onClick={() => setMessage(example)}
              className="w-full p-4 text-left text-lg bg-stone-100 rounded-xl hover:bg-stone-200 transition border border-stone-200"
            >
              &quot;{example}&quot;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
