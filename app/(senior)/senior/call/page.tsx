"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  DailyProvider,
  useCallObject,
  useParticipantIds,
  useLocalParticipant,
  useDaily,
  DailyVideo,
  DailyAudio,
} from "@daily-co/daily-react";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createCallRoom, endCallRoom, type DailyRoom } from "@/app/actions/daily";

// Loading State Component
function ConnectingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[80vh] flex flex-col items-center justify-center"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="bg-green-100 rounded-full p-8 mb-8"
      >
        <Phone className="h-20 w-20 text-green-600" />
      </motion.div>
      <h2 className="text-3xl font-bold text-stone-800 mb-4">Connecting...</h2>
      <p className="text-xl text-stone-600 mb-2">Setting up your video call</p>
      <Loader2 className="h-8 w-8 text-green-500 animate-spin mt-4" />
    </motion.div>
  );
}

// Error State Component
function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <PhoneOff className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-4">
            Couldn't Start Call
          </h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <Button onClick={onRetry} size="lg" className="w-full h-14 text-lg">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Waiting for Buddy Screen
function WaitingScreen({ onEnd }: { onEnd: () => void }) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(
        "You're connected! Waiting for a buddy to join. Please stay on this screen."
      );
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="h-40 w-40 bg-green-500/20 rounded-full flex items-center justify-center mb-8"
      >
        <Phone className="h-20 w-20 text-green-400" />
      </motion.div>
      <h2 className="text-3xl font-bold text-white mb-4">You're Connected!</h2>
      <p className="text-xl text-slate-300 mb-2">Waiting for a buddy to join...</p>
      <p className="text-slate-400">A helper will be with you shortly</p>

      <Button
        onClick={onEnd}
        size="lg"
        className="mt-12 h-16 px-12 text-xl bg-red-500 hover:bg-red-600"
      >
        <PhoneOff className="mr-3 h-6 w-6" />
        Cancel Call
      </Button>
    </div>
  );
}

// Active Call Component
function ActiveCall({ roomName, onEnd }: { roomName: string; onEnd: () => void }) {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const localParticipant = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const remoteParticipants = participantIds.filter(
    (id) => id !== localParticipant?.session_id
  );
  const hasRemote = remoteParticipants.length > 0;

  // Announce when buddy joins
  useEffect(() => {
    if (hasRemote && typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(
        "A buddy has joined the call! You can now talk to them."
      );
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }, [hasRemote]);

  const toggleMute = () => {
    if (daily) {
      daily.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (daily) {
      daily.setLocalVideo(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  if (!hasRemote) {
    return <WaitingScreen onEnd={onEnd} />;
  }

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Main Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video (Full Screen) */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          {remoteParticipants[0] && (
            <DailyVideo
              sessionId={remoteParticipants[0]}
              type="video"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-4 right-4 w-32 h-44 bg-slate-700 rounded-2xl overflow-hidden border-2 border-white shadow-xl">
          {localParticipant && !isVideoOff ? (
            <DailyVideo
              sessionId={localParticipant.session_id}
              type="video"
              mirror
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="h-16 w-16 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">You</span>
              </div>
            </div>
          )}
        </div>

        {/* Call Duration */}
        <div className="absolute top-4 left-4 bg-black/50 px-4 py-2 rounded-full">
          <span className="text-white font-medium">Connected</span>
        </div>
      </div>

      {/* Audio Elements */}
      <DailyAudio />

      {/* Controls */}
      <div className="bg-slate-800 p-6">
        <div className="flex justify-center gap-6">
          {/* Mute Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            className={`h-16 w-16 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? "bg-red-500" : "bg-slate-600 hover:bg-slate-500"
            }`}
          >
            {isMuted ? (
              <MicOff className="h-8 w-8 text-white" />
            ) : (
              <Mic className="h-8 w-8 text-white" />
            )}
          </motion.button>

          {/* Video Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleVideo}
            className={`h-16 w-16 rounded-full flex items-center justify-center transition-colors ${
              isVideoOff ? "bg-red-500" : "bg-slate-600 hover:bg-slate-500"
            }`}
          >
            {isVideoOff ? (
              <VideoOff className="h-8 w-8 text-white" />
            ) : (
              <Video className="h-8 w-8 text-white" />
            )}
          </motion.button>

          {/* End Call Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnd}
            className="h-16 w-24 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
          >
            <PhoneOff className="h-8 w-8 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// Call Wrapper with Daily Provider
function CallWrapper({ room, onEnd }: { room: DailyRoom; onEnd: () => void }) {
  const callObject = useCallObject({
    options: {
      url: room.url,
      startVideoOff: false,
      startAudioOff: false,
    },
  });

  useEffect(() => {
    if (callObject) {
      callObject.join();
    }

    return () => {
      if (callObject) {
        callObject.leave();
      }
    };
  }, [callObject]);

  if (!callObject) {
    return <ConnectingScreen />;
  }

  return (
    <DailyProvider callObject={callObject}>
      <ActiveCall roomName={room.name} onEnd={onEnd} />
    </DailyProvider>
  );
}

// Main Page Component
export default function SeniorCallPage() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [room, setRoom] = useState<DailyRoom | null>(null);
  const [error, setError] = useState<string>("");

  const startCall = useCallback(async () => {
    setState("connecting");

    // Speak
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance("Starting video call...");
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }

    const result = await createCallRoom();

    if (result.success && result.room) {
      setRoom(result.room);
      setState("connected");
    } else {
      setError(result.error || "Failed to start call");
      setState("error");
    }
  }, []);

  const endCall = useCallback(async () => {
    if (room) {
      await endCallRoom(room.name);
    }
    setRoom(null);
    setState("idle");
    router.push("/senior/dashboard");
  }, [room, router]);

  // Idle State - Start Call Button
  if (state === "idle") {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center">
              <Video className="h-7 w-7 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800">Video Call</h1>
          </div>

          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-48 w-48 bg-green-100 rounded-full flex items-center justify-center"
            >
              <Phone className="h-24 w-24 text-green-500" />
            </motion.div>
          </div>

          <Card className="mb-8 bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Connect with a Buddy
              </h3>
              <p className="text-green-700">
                Start a video call and a friendly helper will join you shortly
                to assist with any questions.
              </p>
            </CardContent>
          </Card>

          <Button
            onClick={startCall}
            className="w-full h-20 text-2xl bg-green-500 hover:bg-green-600 scale-hover"
          >
            <Phone className="mr-3 h-8 w-8" />
            Start Video Call
          </Button>
        </motion.div>
      </div>
    );
  }

  // Connecting State
  if (state === "connecting") {
    return <ConnectingScreen />;
  }

  // Error State
  if (state === "error") {
    return <ErrorScreen error={error} onRetry={startCall} />;
  }

  // Connected State - Show Call
  if (state === "connected" && room) {
    return <CallWrapper room={room} onEnd={endCall} />;
  }

  return null;
}
