"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signupAction } from "./actions";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  Shield, 
  ArrowLeft, 
  ArrowRight, 
  Check,
  User,
  Phone,
  Mail,
  Lock,
  HandHeart,
  Sparkles
} from "lucide-react";

type Role = "senior" | "buddy" | null;

interface FormData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  emergencyContact?: string;
  skills?: string;
}

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [step, setStep] = useState<"role" | "form" | "success">("role");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    emergencyContact: "",
    skills: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const skippedTutorial = searchParams.get("skippedTutorial") === "1";

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    // Speak the selection
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const message = role === "senior" 
        ? "You selected Senior. Let's set up your account." 
        : "You selected Volunteer Buddy. Thank you for helping!";
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call server action for signup
      const result = await signupAction({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: selectedRole as "senior" | "buddy",
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        skills: formData.skills,
      });

      if (!result.success) {
        setError(result.error || "Signup failed. Please try again.");
        return;
      }

      setStep("success");
      
      // Speak success
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const message = selectedRole === "senior"
          ? "Welcome! Your account is ready. Redirecting to your dashboard."
          : "Thank you for joining as a volunteer! Redirecting to your dashboard.";
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }

      // Redirect after short delay
      setTimeout(() => {
        router.push(result.redirectTo || "/");
      }, 2000);
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Role Selection Step
  if (step === "role") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 flex flex-col items-center justify-center p-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-12 w-12 text-rose-500" />
            <h1 className="text-4xl font-bold text-slate-800">Join Bridge the Gap</h1>
          </div>
          <p className="text-xl text-slate-600">
            How would you like to participate?
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Senior Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="h-full cursor-pointer border-2 border-transparent hover:border-amber-400 transition-all duration-300 hover:shadow-2xl group"
              onClick={() => handleRoleSelect("senior")}
            >
              <CardContent className="p-8 text-center">
                <div className="h-32 w-32 mx-auto bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <User className="h-16 w-16 text-amber-600" />
                </div>
<h2 className="text-3xl font-bold text-slate-800 mb-4">
                  I&apos;m a Senior
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  Get help with technology, stay safe from scams, and connect with caring volunteers.
                </p>
                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-slate-700">
                    <Check className="h-5 w-5 text-green-500" />
                    Large, easy-to-read buttons
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <Check className="h-5 w-5 text-green-500" />
                    Voice guidance on every screen
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <Check className="h-5 w-5 text-green-500" />
                    One-tap video calls for help
                  </li>
                </ul>
                <Button size="lg" className="w-full h-14 text-xl bg-amber-500 hover:bg-amber-600 group-hover:scale-105 transition-transform">
                  <User className="mr-2 h-5 w-5" />
                  Join as Senior
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Buddy/Volunteer Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className="h-full cursor-pointer border-2 border-transparent hover:border-blue-400 transition-all duration-300 hover:shadow-2xl group"
              onClick={() => handleRoleSelect("buddy")}
            >
              <CardContent className="p-8 text-center">
                <div className="h-32 w-32 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HandHeart className="h-16 w-16 text-blue-600" />
                </div>
<h2 className="text-3xl font-bold text-slate-800 mb-4">
                  I&apos;m a Volunteer
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  Help seniors navigate technology safely and make a real difference in their lives.
                </p>
                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-slate-700">
                    <Check className="h-5 w-5 text-green-500" />
                    Real-time SOS alerts
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <Check className="h-5 w-5 text-green-500" />
                    AI-powered safety monitoring
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <Check className="h-5 w-5 text-green-500" />
                    Earn badges & recognition
                  </li>
                </ul>
                <Button size="lg" className="w-full h-14 text-xl bg-blue-500 hover:bg-blue-600 group-hover:scale-105 transition-transform">
                  <HandHeart className="mr-2 h-5 w-5" />
                  Join as Volunteer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Already have account */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-slate-600"
        >
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign In
          </Link>
        </motion.p>
      </div>
    );
  }

  // Success Step
  if (step === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="h-32 w-32 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-xl"
        >
          <Check className="h-16 w-16 text-white" strokeWidth={3} />
        </motion.div>
        <h1 className="text-4xl font-bold text-slate-800 mb-4 text-center">
          Welcome to Bridge the Gap!
        </h1>
        <p className="text-xl text-slate-600 mb-2">
          {selectedRole === "senior" 
            ? "Your account is ready. Taking you to your dashboard..."
            : "Thank you for volunteering! Redirecting..."}
        </p>
        <motion.div 
          className="mt-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-8 w-8 text-green-500" />
        </motion.div>
      </motion.div>
    );
  }

  // Form Step
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setStep("role")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Role Selection
        </Button>

        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              selectedRole === "senior" 
                ? "bg-amber-100" 
                : "bg-blue-100"
            }`}>
              {selectedRole === "senior" 
                ? <User className="h-8 w-8 text-amber-600" />
                : <HandHeart className="h-8 w-8 text-blue-600" />
              }
            </div>
            <CardTitle className="text-2xl">
              {selectedRole === "senior" ? "Senior Registration" : "Volunteer Registration"}
            </CardTitle>
            <CardDescription>
              {selectedRole === "senior" 
                ? "Just a few simple steps to get started"
                : "Tell us about yourself so we can match you with seniors"}
            </CardDescription>
            {skippedTutorial && selectedRole === "senior" && (
              <div className="mt-3">
                <Link
                  href="/tutorial/signup"
                  className="text-sm font-semibold text-amber-600 hover:text-amber-700"
                >
                  Replay Tutorial
                </Link>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="h-14 text-lg"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-14 text-lg"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-lg flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="h-14 text-lg"
                />
                <p className="text-sm text-slate-500">At least 6 characters</p>
              </div>

              {/* Phone (Optional for Senior, Required for Buddy) */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-lg flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number {selectedRole === "senior" && <span className="text-slate-400 text-sm">(Optional)</span>}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required={selectedRole === "buddy"}
                  className="h-14 text-lg"
                />
              </div>

              {/* Emergency Contact (Senior only) */}
              {selectedRole === "senior" && (
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-lg flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Emergency Contact
                  </Label>
                  <Input
                    id="emergencyContact"
                    type="text"
                    placeholder="Family member's phone or email"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="h-14 text-lg"
                  />
<p className="text-sm text-slate-500">
                    We&apos;ll notify them if you press the SOS button
                  </p>
                </div>
              )}

              {/* Skills (Buddy only) */}
              {selectedRole === "buddy" && (
                <div className="space-y-2">
                  <Label htmlFor="skills" className="text-lg flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Your Skills
                  </Label>
                  <Input
                    id="skills"
                    type="text"
                    placeholder="e.g., Tech support, Languages spoken"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="h-14 text-lg"
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-100 border border-red-200 rounded-lg text-red-700"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className={`w-full h-16 text-xl ${
                  selectedRole === "senior"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Sparkles className="h-5 w-5" />
                    </motion.div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create My Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Already have account */}
            <p className="mt-6 text-center text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
