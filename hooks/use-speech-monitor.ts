"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechMonitorOptions {
  onResult?: (text: string) => void;
  onThreatDetected?: (threat: ThreatDetection) => void;
  debounceMs?: number;
  language?: string;
  enabled?: boolean;
  sessionId?: string;
}

export interface ThreatDetection {
  safe: boolean;
  reason: string;
  text: string;
  timestamp: Date;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useSpeechMonitor({
  onResult,
  onThreatDetected,
  debounceMs = 2000,
  language = "en-US",
  enabled = true,
  sessionId,
}: UseSpeechMonitorOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [threats, setThreats] = useState<ThreatDetection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalyzedRef = useRef<string>("");

  // Check for browser support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setIsSupported(false);
        setError("Speech recognition is not supported in this browser");
      }
    }
  }, []);

  // Analyze text for threats
  const analyzeText = useCallback(
    async (text: string) => {
      if (!text.trim() || text === lastAnalyzedRef.current) return;
      lastAnalyzedRef.current = text;

      setIsAnalyzing(true);
      try {
        const response = await fetch("/api/ai/monitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, sessionId }),
        });

        if (!response.ok) {
          console.error("Monitor API error:", response.status);
          return;
        }

        const result = await response.json();

        if (!result.safe) {
          const threat: ThreatDetection = {
            safe: false,
            reason: result.reason,
            text,
            timestamp: new Date(),
          };
          setThreats((prev) => [...prev, threat]);
          onThreatDetected?.(threat);
        }
      } catch (err) {
        console.error("Error analyzing speech:", err);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [sessionId, onThreatDetected]
  );

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported || !enabled) return;

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalText = "";
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + " ";
          } else {
            interimText += result[0].transcript;
          }
        }

        if (finalText) {
          setTranscript((prev) => {
            const newTranscript = prev + finalText;
            onResult?.(finalText.trim());

            // Debounce analysis
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
              analyzeText(newTranscript);
            }, debounceMs);

            return newTranscript;
          });
        }

        setInterimTranscript(interimText);
      };

      recognition.onerror = (event: Event & { error: string }) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow microphone access.");
        } else if (event.error !== "aborted") {
          setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Auto-restart if still enabled
        if (enabled && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Ignore errors on restart
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setError(null);
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setError("Failed to start speech recognition");
    }
  }, [isSupported, enabled, language, debounceMs, onResult, analyzeText]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    lastAnalyzedRef.current = "";
  }, []);

  // Clear threats
  const clearThreats = useCallback(() => {
    setThreats([]);
  }, []);

  // Auto-start/stop based on enabled prop
  useEffect(() => {
    if (enabled && !isListening && isSupported) {
      startListening();
    } else if (!enabled && isListening) {
      stopListening();
    }

    return () => {
      stopListening();
    };
  }, [enabled, isSupported]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isListening,
    isSupported,
    isAnalyzing,
    transcript,
    interimTranscript,
    threats,
    error,
    startListening,
    stopListening,
    clearTranscript,
    clearThreats,
  };
}
