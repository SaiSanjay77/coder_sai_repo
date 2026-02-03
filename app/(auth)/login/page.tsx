"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Users, UserPlus } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { data: { user: authUser }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else if (authUser?.user_metadata?.role === "senior") {
      window.location.href = "/senior/dashboard";
    } else if (authUser?.user_metadata?.role === "buddy") {
      window.location.href = "/buddy/dashboard";
    } else {
      // Fallback
      window.location.href = "/";
    }

    setIsLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Check your email for the magic link!" });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="h-12 w-12 text-rose-500" />
          <h1 className="text-4xl font-bold text-slate-800">Bridge the Gap</h1>
        </div>
        <p className="text-xl text-slate-600 max-w-md">
          Connecting Seniors with Caring Buddies for Digital Safety & Support
        </p>
      </div>

      {/* Features Icons */}
      <div className="flex gap-8 mb-8">
        <div className="flex flex-col items-center text-slate-600">
          <Shield className="h-8 w-8 mb-2" />
          <span className="text-sm">Safe</span>
        </div>
        <div className="flex flex-col items-center text-slate-600">
          <Users className="h-8 w-8 mb-2" />
          <span className="text-sm">Connected</span>
        </div>
        <div className="flex flex-col items-center text-slate-600">
          <Heart className="h-8 w-8 mb-2" />
          <span className="text-sm">Caring</span>
        </div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isMagicLink ? handleMagicLink : handlePasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 text-lg"
                data-speak="true"
              />
            </div>

            {!isMagicLink && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-lg">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isMagicLink}
                  className="h-14 text-lg"
                  data-speak="true"
                />
              </div>
            )}

            {message && (
              <div
                className={`p-4 rounded-lg text-center text-lg ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-xl"
              disabled={isLoading}
            >
              {isLoading
                ? "Please wait..."
                : isMagicLink
                ? "Send Magic Link"
                : "Sign In"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-lg"
              onClick={() => {
                setIsMagicLink(!isMagicLink);
                setMessage(null);
              }}
            >
              {isMagicLink ? "Use Password Instead" : "Use Magic Link (No Password)"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-slate-600 mb-3">Don&apos;t have an account?</p>
            <Link href="/signup">
              <Button 
                type="button"
                variant="outline" 
                className="w-full h-12 text-lg border-2"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Create New Account
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-slate-500 text-sm">
        Need help? Call our support line: 1800-BRIDGE
      </p>
    </div>
  );
}
