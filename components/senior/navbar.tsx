"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Settings, LogOut, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useTranslation } from "@/components/providers/accessibility-provider";
import { LanguageToggle } from "@/components/senior/language-toggle";

const navItems = [
  { href: "/senior/dashboard", icon: Home, labelKey: "home" as const },
  { href: "/senior/settings", icon: Settings, labelKey: "settings" as const },
];

export function SeniorNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="floating-navbar flex items-center gap-2"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex flex-col items-center justify-center p-4 rounded-full transition-colors ${
                isActive
                  ? "bg-amber-500 text-white"
                  : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              <Icon className="h-7 w-7" strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-6 text-xs font-semibold text-amber-600 whitespace-nowrap"
                >
                  {t(item.labelKey)}
                </motion.span>
              )}
            </motion.div>
          </Link>
        );
      })}

      <div className="ml-auto flex items-center gap-2">
        <LanguageToggle />

        {/* Divider */}
        <div className="h-10 w-px bg-stone-200 mx-1" />

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center justify-center p-4 rounded-full text-red-400 hover:bg-red-50 transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="h-7 w-7" strokeWidth={2} />
        </motion.button>
      </div>
    </motion.nav>
  );
}

export function SeniorTopBar() {
  return (
    <header className="sticky top-0 z-40 bg-stone-50/80 backdrop-blur-md border-b border-stone-200 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌉</span>
          <div>
            <h1 className="text-xl font-bold text-stone-800">Bridge the Gap</h1>
            <p className="text-stone-500 text-sm">Safety for Seniors</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
