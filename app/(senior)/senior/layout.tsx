"use client";

import { AudioGuide } from "@/components/audio-guide";
import { SeniorNavbar, SeniorTopBar } from "@/components/senior/navbar";
import { PageTransition } from "@/components/providers/page-transition";
import { AccessibilityProvider } from "@/components/providers/accessibility-provider";
import { ChatBubble } from "@/components/ai/chat-bubble";

export default function SeniorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccessibilityProvider>
      <AudioGuide>
        <div className="min-h-screen bg-stone-50">
          {/* Top Bar */}
          <SeniorTopBar />

          {/* Main Content with padding for navbar */}
          <main className="pb-32 px-4 pt-6">
            <PageTransition>
              {children}
            </PageTransition>
          </main>

          {/* Floating Bottom Navbar */}
          <SeniorNavbar />

          {/* AI Chat Bubble */}
          <ChatBubble />

          {/* Audio Feedback Indicator */}
          <div 
            className="fixed bottom-24 left-4 bg-stone-200 rounded-full p-3 shadow-lg speak-hover"
            data-speak-text="Audio guide is active. Hover over any button to hear what it does."
          >
            <span className="text-2xl" aria-label="Audio guide active">🔊</span>
          </div>
        </div>
      </AudioGuide>
    </AccessibilityProvider>
  );
}
