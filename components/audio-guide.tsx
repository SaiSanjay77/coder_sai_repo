"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * AudioGuide Component
 * Provides text-to-speech functionality for elements with class "speak-hover"
 * Designed for senior accessibility - slower speech rate, clear pronunciation
 */
export function AudioGuide({ children }: { children: React.ReactNode }) {
  // Ref to track if component is mounted (prevents memory leaks)
  const isMountedRef = useRef(true);

  const speak = useCallback((text: string) => {
    // Guard: Check window and speechSynthesis exist
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) return;
    if (!text || text.trim() === "") return;

    // Cancel any ongoing speech before starting new
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = 0.85; // Slightly slower for seniors
    utterance.pitch = 1;
    utterance.volume = 1;

    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Safely get language attribute with null check
    const language = document.body?.getAttribute?.("data-language") || "en";
    
    // Find appropriate voices
    const tamilVoice = voices.find((voice) => voice.lang === "ta-IN");
    const englishVoice = voices.find(
      (voice) => voice.lang.includes("en") && voice.name.includes("Female")
    ) || voices.find((voice) => voice.lang.includes("en"));

    // Set voice based on language preference
    if (language === "ta") {
      if (tamilVoice) {
        utterance.voice = tamilVoice;
        utterance.lang = "ta-IN";
      } else if (englishVoice) {
        console.warn("Tamil voice (ta-IN) not found. Falling back to English.");
        utterance.voice = englishVoice;
      }
    } else if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // Small delay to ensure browser readiness
    setTimeout(() => {
      if (isMountedRef.current && window.speechSynthesis) {
        window.speechSynthesis.speak(utterance);
      }
    }, 10);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    /**
     * CRITICAL FIX: Strict Type Guard
     * Prevents "Cannot read properties of undefined (reading 'contains')" error
     * The event target may not always be an HTMLElement (could be Document, Window, SVG, etc.)
     */
    const handleMouseEnter = (e: Event) => {
      // FIX: Strict type guard - ensure target is HTMLElement
      if (!e.target) return;
      if (!(e.target instanceof HTMLElement)) return;
      
      const target = e.target;
      
      // FIX: Safe classList check with optional chaining
      if (!target.classList?.contains("speak-hover")) return;

      // Get text to speak with fallbacks
      const textToSpeak = target.dataset?.speakText || target.innerText || target.textContent || "";
      if (textToSpeak.trim()) {
        speak(textToSpeak);
      }
    };

    const handleMouseLeave = (e: Event) => {
      // FIX: Strict type guard
      if (!e.target) return;
      if (!(e.target instanceof HTMLElement)) return;
      
      const target = e.target;
      
      // FIX: Safe classList check
      if (!target.classList?.contains("speak-hover")) return;

      stopSpeaking();
    };

    const handleFocus = (e: Event) => {
      // FIX: Strict type guard
      if (!e.target) return;
      if (!(e.target instanceof HTMLElement)) return;

      const target = e.target;
      
      // FIX: Safe classList check
      if (!target.classList?.contains("speak-hover")) return;

      const textToSpeak = target.dataset?.speakText || target.innerText || target.textContent || "";
      if (textToSpeak.trim()) {
        speak(textToSpeak);
      }
    };

    // Add listeners using capture phase to catch all elements
    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("mouseleave", handleMouseLeave, true);
    document.addEventListener("focus", handleFocus, true);

    return () => {
      isMountedRef.current = false;
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("mouseleave", handleMouseLeave, true);
      document.removeEventListener("focus", handleFocus, true);
      stopSpeaking();
    };
  }, [speak, stopSpeaking]);

  // Load voices on mount (some browsers need this to populate voice list)
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Initial load
      window.speechSynthesis.getVoices();
      
      // Some browsers fire voiceschanged event when voices are ready
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      
      window.speechSynthesis.addEventListener?.("voiceschanged", handleVoicesChanged);
      
      return () => {
        window.speechSynthesis.removeEventListener?.("voiceschanged", handleVoicesChanged);
      };
    }
  }, []);

  return <>{children}</>;
}
