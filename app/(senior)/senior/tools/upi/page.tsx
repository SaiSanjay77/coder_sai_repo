"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, IndianRupee, AlertCircle } from "lucide-react";

// Zod Validation Schemas
const amountSchema = z.object({
  amount: z
    .string()
    .min(1, "Please enter an amount")
    .refine((val) => !isNaN(parseFloat(val)), "Please enter a valid number")
    .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0")
    .refine((val) => parseFloat(val) <= 100000, "Amount cannot exceed ₹1,00,000"),
});

const pinSchema = z.object({
  pin: z
    .string()
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^\d{4}$/, "PIN must contain only numbers"),
});

type AmountForm = z.infer<typeof amountSchema>;
type Step = "amount" | "pin" | "success";

export default function UPISimulator() {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AmountForm>({
    resolver: zodResolver(amountSchema),
    defaultValues: { amount: "" },
  });

  const watchedAmount = watch("amount");

  const onAmountSubmit = (data: AmountForm) => {
    setAmount(data.amount);
    setStep("pin");
    // Speak instruction
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(
        `Amount ${data.amount} rupees entered. Now enter your 4 digit PIN to complete the payment.`
      );
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePinSubmit = () => {
    // Validate PIN with Zod
    const result = pinSchema.safeParse({ pin });
    if (!result.success) {
      setPinError(result.error.issues[0].message);
      // Speak error
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(result.error.issues[0].message);
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }
      return;
    }
    
    setPinError(null);
    setStep("success");
    // Speak success
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(
        `Payment successful! ${amount} rupees sent. This was just practice. No real money was sent.`
      );
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit);
      setPinError(null);
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
    setPinError(null);
  };

  const resetSimulator = () => {
    setStep("amount");
    setAmount("");
    setPin("");
    setPinError(null);
    setValue("amount", "");
  };

  // ===== STEP 3: SUCCESS SCREEN =====
  if (step === "success") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="bg-green-500 rounded-full p-8 w-36 h-36 mx-auto mb-8 flex items-center justify-center shadow-2xl">
            <Check className="h-20 w-20 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            Payment Successful! ✅
          </h1>
          <p className="text-2xl text-stone-600 mb-2">
            ₹{amount} sent successfully
          </p>
          <div className="bg-amber-100 border-2 border-amber-300 rounded-xl p-6 mt-8 max-w-md mx-auto">
            <p className="text-xl text-amber-800">
              🎓 <strong>This was practice!</strong><br />
              No real money was sent. Great job learning!
            </p>
          </div>
          <div className="mt-10 space-y-4">
            <Button
              onClick={resetSimulator}
              className="h-16 px-10 text-xl bg-blue-500 hover:bg-blue-600"
            >
              Practice Again
            </Button>
            <br />
            <Link href="/senior/dashboard">
              <Button variant="outline" className="h-14 px-8 text-lg mt-4">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===== STEP 2: PIN ENTRY =====
  if (step === "pin") {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStep("amount")}
            className="h-12 w-12"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-stone-800">Enter UPI PIN</h1>
        </div>

        {/* Payment Summary */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <p className="text-stone-600 text-lg">Paying</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">₹{amount}</p>
            <p className="text-stone-500 mt-2">to Grocery Store</p>
          </CardContent>
        </Card>

        {/* PIN Display */}
        <div className="flex justify-center gap-4 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={pin.length === i ? { scale: [1, 1.1, 1] } : {}}
              className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-bold transition-all ${
                pin.length > i
                  ? "border-blue-500 bg-blue-100 text-blue-600"
                  : pinError
                  ? "border-red-300 bg-red-50"
                  : "border-stone-300 bg-white"
              }`}
            >
              {pin.length > i ? "●" : ""}
            </motion.div>
          ))}
        </div>

        {/* PIN Error Message */}
        <AnimatePresence>
          {pinError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 text-red-500 mb-4"
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-lg">{pinError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
            (digit, index) => (
              <Button
                key={index}
                variant={digit === "⌫" ? "outline" : "secondary"}
                className={`h-20 text-3xl font-bold ${digit === "" ? "invisible" : ""}`}
                onClick={() => {
                  if (digit === "⌫") {
                    handlePinDelete();
                  } else if (digit) {
                    handlePinDigit(digit);
                  }
                }}
                disabled={digit === ""}
              >
                {digit}
              </Button>
            )
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handlePinSubmit}
          disabled={pin.length !== 4}
          className="w-full h-16 text-xl bg-green-500 hover:bg-green-600 disabled:bg-stone-300"
        >
          Submit PIN & Pay
        </Button>

        {/* Safety Note */}
        <p className="text-center text-stone-500 mt-6 text-sm">
          🔒 This is a safe practice environment
        </p>
      </motion.div>
    );
  }

  // ===== STEP 1: AMOUNT ENTRY =====
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/senior/dashboard">
          <Button variant="ghost" size="icon" className="h-12 w-12">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-stone-800">
          Practice UPI Payment
        </h1>
      </div>

      {/* Fake GPay Style Header */}
      <Card className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 border-none text-white shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-4">
              <IndianRupee className="h-8 w-8" />
            </div>
            <div>
              <p className="text-white/80 text-lg">Paying to</p>
              <p className="text-2xl font-bold">Grocery Store</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onAmountSubmit)}>
        {/* Amount Input */}
        <div className="mb-6">
          <label className="text-xl text-stone-700 mb-3 block font-medium">
            Enter Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-bold text-stone-400">
              ₹
            </span>
            <Input
              type="number"
              {...register("amount")}
              placeholder="0"
              className={`h-24 text-5xl font-bold pl-14 text-center border-2 ${
                errors.amount ? "border-red-400 bg-red-50" : "border-stone-300 focus:border-blue-500"
              }`}
            />
          </div>
          {/* Validation Error */}
          <AnimatePresence>
            {errors.amount && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-red-500 mt-3"
              >
                <AlertCircle className="h-5 w-5" />
                <span className="text-lg">{errors.amount.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {["100", "500", "1000"].map((quickAmount) => (
            <Button
              key={quickAmount}
              type="button"
              variant="outline"
              className="h-16 text-xl font-semibold"
              onClick={() => setValue("amount", quickAmount)}
            >
              ₹{quickAmount}
            </Button>
          ))}
        </div>

        {/* Pay Button */}
        <Button
          type="submit"
          className="w-full h-20 text-2xl bg-blue-500 hover:bg-blue-600 disabled:bg-stone-300"
        >
          Pay ₹{watchedAmount || "0"}
        </Button>
      </form>

      {/* Practice Mode Banner */}
      <div className="bg-amber-100 border-2 border-amber-300 rounded-xl p-4 mt-8">
        <p className="text-lg text-amber-800 text-center">
          🎓 <strong>Practice Mode</strong> - No real money will be sent!
        </p>
      </div>
    </motion.div>
  );
}
