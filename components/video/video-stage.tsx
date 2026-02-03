"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DailyProvider,
  useParticipantIds,
  useLocalParticipant,
  useDaily,
  DailyVideo,
  DailyAudio,
} from "@daily-co/daily-react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  AlertTriangle,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSpeechMonitor, ThreatDetection } from "@/hooks/use-speech-monitor";
import { createClient } from "@/utils/supabase/client";

interface VideoStageProps {
  roomUrl: string;
  roomName: string;
  userRole: "senior" | "buddy";
  sessionId?: string;
  onLeave?: () => void;
}

// Senior View - Simple, large buttons
function SeniorVideoView({ onLeave }: { onLeave?: () => void }) {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const participantIds = useParticipantIds({ filter: "remote" });
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleEndCall = useCallback(() => {
    if (daily) {
      daily.leave();
    }
    onLeave?.();
  }, [daily, onLeave]);

  const toggleMute = useCallback(() => {
    if (daily) {
      daily.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  }, [daily, isMuted]);

  const toggleVideo = useCallback(() => {
    if (daily) {
      daily.setLocalVideo(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  }, [daily, isVideoOff]);

  const remoteParticipantId = participantIds[0];

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col z-50">
      {/* Main Video Area - Buddy's video (or placeholder) */}
      <div className="flex-1 relative">
        {remoteParticipantId ? (
          <DailyVideo
            sessionId={remoteParticipantId}
            type="video"
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
            >
              <Phone className="h-24 w-24 text-green-400 mx-auto mb-4" />
              <p className="text-2xl text-white">Waiting for buddy...</p>
              <p className="text-slate-400">A helper will join shortly</p>
            </motion.div>
          </div>
        )}

        {/* Self-view (small corner) */}
        {localParticipant && (
          <div className="absolute top-4 right-4 w-32 h-24 md:w-48 md:h-36 bg-slate-800 rounded-xl overflow-hidden border-2 border-white/20">
            <DailyVideo
              sessionId={localParticipant.session_id}
              type="video"
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                <VideoOff className="h-8 w-8 text-slate-400" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audio */}
      <DailyAudio />

      {/* Controls - Large and Senior-Friendly */}
      <div className="bg-slate-800 p-6 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-4">
          {/* Mute Button */}
          <Button
            onClick={toggleMute}
            size="lg"
            variant={isMuted ? "destructive" : "secondary"}
            className="h-20 w-20 rounded-full"
          >
            {isMuted ? (
              <MicOff className="h-10 w-10" />
            ) : (
              <Mic className="h-10 w-10" />
            )}
          </Button>

          {/* End Call - HUGE RED BUTTON */}
          <Button
            onClick={handleEndCall}
            size="lg"
            className="h-24 w-40 rounded-full bg-red-500 hover:bg-red-600 text-white"
          >
            <PhoneOff className="h-12 w-12 mr-2" />
            <span className="text-xl font-bold">End</span>
          </Button>

          {/* Video Toggle */}
          <Button
            onClick={toggleVideo}
            size="lg"
            variant={isVideoOff ? "destructive" : "secondary"}
            className="h-20 w-20 rounded-full"
          >
            {isVideoOff ? (
              <VideoOff className="h-10 w-10" />
            ) : (
              <Video className="h-10 w-10" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Buddy View - Professional with Safety Panel
function BuddyVideoView({
  sessionId,
  onLeave,
}: {
  sessionId?: string;
  onLeave?: () => void;
}) {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const participantIds = useParticipantIds({ filter: "remote" });
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [alerts, setAlerts] = useState<ThreatDetection[]>([]);
  const supabase = createClient();

  // Speech monitoring with threat detection
  const {
    isListening,
    isAnalyzing,
    transcript,
    threats,
    clearThreats,
  } = useSpeechMonitor({
    enabled: true,
    sessionId,
    onThreatDetected: (threat) => {
      setAlerts((prev) => [threat, ...prev].slice(0, 10));
      // Play alert sound
      if (typeof window !== "undefined") {
        try {
          const audioContext = new AudioContext();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = 880;
          oscillator.type = "sine";
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
          // Ignore audio errors
        }
      }
    },
  });

  // Subscribe to danger_alerts from Supabase
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`alerts-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "danger_alerts",
          filter: `call_session_id=eq.${sessionId}`,
        },
        (payload: { new: { reason?: string; detected_text?: string; created_at: string } }) => {
          const newAlert: ThreatDetection = {
            safe: false,
            reason: payload.new.reason || "Potential threat detected",
            text: payload.new.detected_text || "",
            timestamp: new Date(payload.new.created_at),
          };
          setAlerts((prev) => [newAlert, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, supabase]);

  const handleEndCall = useCallback(() => {
    if (daily) {
      daily.leave();
    }
    onLeave?.();
  }, [daily, onLeave]);

  const toggleMute = useCallback(() => {
    if (daily) {
      daily.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  }, [daily, isMuted]);

  const toggleVideo = useCallback(() => {
    if (daily) {
      daily.setLocalVideo(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  }, [daily, isVideoOff]);

  const remoteParticipantId = participantIds[0];

  return (
    <div className="fixed inset-0 bg-slate-950 flex z-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-2 gap-2 p-2">
          {/* Remote Video (Senior) */}
          <div className="relative bg-slate-800 rounded-xl overflow-hidden">
            {remoteParticipantId ? (
              <DailyVideo
                sessionId={remoteParticipantId}
                type="video"
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-slate-400 animate-spin mx-auto mb-3" />
                  <p className="text-slate-400">Waiting for senior...</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-slate-900/80">Senior</Badge>
            </div>
          </div>

          {/* Local Video (Buddy) */}
          <div className="relative bg-slate-800 rounded-xl overflow-hidden">
            {localParticipant && (
              <DailyVideo
                sessionId={localParticipant.session_id}
                type="video"
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
            )}
            {isVideoOff && (
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                <VideoOff className="h-12 w-12 text-slate-400" />
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-blue-600">You</Badge>
            </div>
          </div>
        </div>

        {/* Audio */}
        <DailyAudio />

        {/* Controls */}
        <div className="bg-slate-900 p-4 border-t border-slate-800">
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={toggleMute}
              size="lg"
              variant={isMuted ? "destructive" : "secondary"}
              className="h-14 w-14 rounded-full"
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            <Button
              onClick={handleEndCall}
              size="lg"
              className="h-14 px-8 rounded-full bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="h-6 w-6 mr-2" />
              End Call
            </Button>

            <Button
              onClick={toggleVideo}
              size="lg"
              variant={isVideoOff ? "destructive" : "secondary"}
              className="h-14 w-14 rounded-full"
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Safety Panel (Right Sidebar) */}
      <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            <h3 className="font-semibold text-white">AI Safety Monitor</h3>
            {isListening && (
              <Badge variant="outline" className="ml-auto border-green-500 text-green-400">
                <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse mr-1.5" />
                Listening
              </Badge>
            )}
          </div>
          {isAnalyzing && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Analyzing speech...
            </p>
          )}
        </div>

        {/* Alerts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-green-500/30 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No threats detected</p>
              <p className="text-slate-600 text-xs mt-1">
                AI is monitoring the conversation
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {alerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-900/30 border border-red-500/50 rounded-lg p-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-red-300 font-medium text-sm">
                        ⚠️ Potential Scam Detected
                      </p>
                      <p className="text-red-200/80 text-xs mt-1">
                        {alert.reason}
                      </p>
                      {alert.text && (
                        <p className="text-slate-400 text-xs mt-2 truncate">
                          "{alert.text.slice(0, 80)}..."
                        </p>
                      )}
                      <p className="text-slate-500 text-xs mt-1">
                        {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Live Transcript */}
        <div className="border-t border-slate-800 p-4">
          <h4 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
            Live Transcript
          </h4>
          <div className="bg-slate-800/50 rounded-lg p-3 h-24 overflow-y-auto">
            <p className="text-slate-300 text-sm">
              {transcript || (
                <span className="text-slate-500 italic">
                  Speech will appear here...
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main VideoStage Component with DailyProvider
export default function VideoStage({
  roomUrl,
  roomName,
  userRole,
  sessionId,
  onLeave,
}: VideoStageProps) {
  const [callState, setCallState] = useState<"joining" | "joined" | "error">("joining");
  const [error, setError] = useState<string | null>(null);

  return (
    <DailyProvider url={roomUrl}>
      <VideoStageInner
        roomUrl={roomUrl}
        roomName={roomName}
        userRole={userRole}
        sessionId={sessionId}
        onLeave={onLeave}
        callState={callState}
        setCallState={setCallState}
        error={error}
        setError={setError}
      />
    </DailyProvider>
  );
}

function VideoStageInner({
  roomUrl,
  userRole,
  sessionId,
  onLeave,
  callState,
  setCallState,
  setError,
}: VideoStageProps & {
  callState: string;
  setCallState: (state: "joining" | "joined" | "error") => void;
  error: string | null;
  setError: (error: string | null) => void;
}) {
  const daily = useDaily();

  // Join call on mount
  useEffect(() => {
    if (!daily) return;

    const joinCall = async () => {
      try {
        await daily.join({ url: roomUrl });
        setCallState("joined");

        // Speak confirmation for seniors
        if (userRole === "senior" && typeof window !== "undefined" && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(
            "You are now connected to the video call."
          );
          utterance.rate = 0.85;
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.error("Failed to join call:", err);
        setError("Failed to join the call. Please try again.");
        setCallState("error");
      }
    };

    joinCall();

    return () => {
      daily.leave();
    };
  }, [daily, roomUrl, userRole, setCallState, setError]);

  // Show joining state
  if (callState === "joining") {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="bg-green-100 rounded-full p-8 mb-8"
        >
          <Phone className="h-20 w-20 text-green-600" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">Joining Call...</h2>
        <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
      </div>
    );
  }

  // Render appropriate view based on role
  if (userRole === "senior") {
    return <SeniorVideoView onLeave={onLeave} />;
  }

  return <BuddyVideoView sessionId={sessionId} onLeave={onLeave} />;
}
