"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Phone,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import VideoStage from "@/components/video/video-stage";
import { acceptRequestAndCreateCall } from "@/app/actions/daily";

interface CallRequest {
  id: string;
  senior_id: string;
  status: string;
  request_type: string;
  call_url?: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface ActiveCall {
  roomUrl: string;
  roomName: string;
  sessionId: string;
  seniorName: string;
}

export default function BuddyCallsPage() {
  const [pendingCalls, setPendingCalls] = useState<CallRequest[]>([]);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Load pending call requests
  useEffect(() => {
    const loadPendingCalls = async () => {
      const { data } = await supabase
        .from("help_requests")
        .select(`
          *,
          profiles:senior_id (full_name)
        `)
        .in("status", ["pending", "accepted"])
        .order("created_at", { ascending: false });

      if (data) {
        setPendingCalls(data);
      }
    };

    loadPendingCalls();

    // Real-time subscription
    const channel = supabase
      .channel("call-requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "help_requests",
        },
        () => {
          loadPendingCalls();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Accept and join a call
  const handleJoinCall = useCallback(
    async (request: CallRequest) => {
      setIsJoining(request.id);
      setError(null);

      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("You must be logged in to join calls");
          return;
        }

        // Create the call room
        const result = await acceptRequestAndCreateCall(request.id, user.id);

        if (!result.success || !result.room) {
          setError(result.error || "Failed to create call room");
          return;
        }

        // Set active call
        setActiveCall({
          roomUrl: result.room.url,
          roomName: result.room.name,
          sessionId: result.room.id,
          seniorName: request.profiles?.full_name || "Senior",
        });
      } catch (err) {
        console.error("Error joining call:", err);
        setError("Failed to join call. Please try again.");
      } finally {
        setIsJoining(null);
      }
    },
    [supabase]
  );

  // Join an existing call (if call_url already exists)
  const handleRejoinCall = useCallback((request: CallRequest) => {
    if (!request.call_url) return;

    const roomName = request.call_url.split("/").pop() || "";
    setActiveCall({
      roomUrl: request.call_url,
      roomName,
      sessionId: request.id,
      seniorName: request.profiles?.full_name || "Senior",
    });
  }, []);

  // Leave call
  const handleLeaveCall = useCallback(async () => {
    setActiveCall(null);
    // Refresh the list
    const { data } = await supabase
      .from("help_requests")
      .select(`
        *,
        profiles:senior_id (full_name)
      `)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false });

    if (data) {
      setPendingCalls(data);
    }
  }, [supabase]);

  // If in a call, show the video stage
  if (activeCall) {
    return (
      <VideoStage
        roomUrl={activeCall.roomUrl}
        roomName={activeCall.roomName}
        userRole="buddy"
        sessionId={activeCall.sessionId}
        onLeave={handleLeaveCall}
      />
    );
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingRequests = pendingCalls.filter((c) => c.status === "pending");
  const activeCalls = pendingCalls.filter(
    (c) => c.status === "accepted" && c.call_url
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Video Calls</h1>
          <p className="text-slate-400">Accept calls from seniors who need help</p>
        </div>
        <Badge
          variant={pendingRequests.length > 0 ? "destructive" : "secondary"}
          className={pendingRequests.length > 0 ? "animate-pulse" : ""}
        >
          {pendingRequests.length} Waiting
        </Badge>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <p className="text-red-300">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-auto"
          >
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* Active Calls (Can Rejoin) */}
      {activeCalls.length > 0 && (
        <Card className="bg-green-900/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Video className="h-5 w-5" />
              Active Calls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeCalls.map((call) => (
              <div
                key={call.id}
                className="bg-slate-800 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {call.profiles?.full_name || "Senior"}
                    </p>
                    <p className="text-sm text-slate-400">
                      Call in progress
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleRejoinCall(call)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Rejoin
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Call Requests */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-amber-500" />
            Incoming Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No pending call requests</p>
              <p className="text-slate-500 text-sm mt-1">
                New requests will appear here automatically
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-slate-800 border border-amber-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="h-12 w-12 bg-amber-500/20 rounded-full flex items-center justify-center"
                        >
                          <Phone className="h-6 w-6 text-amber-400" />
                        </motion.div>
                        <div>
                          <p className="font-semibold text-white">
                            {request.profiles?.full_name || "Senior"}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Badge
                              variant="outline"
                              className="border-red-500 text-red-400"
                            >
                              {request.request_type === "sos"
                                ? "🚨 SOS"
                                : request.request_type}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(request.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleJoinCall(request)}
                        disabled={isJoining === request.id}
                        className="bg-green-600 hover:bg-green-700 h-12 px-6"
                      >
                        {isJoining === request.id ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="mr-2"
                            >
                              <Video className="h-5 w-5" />
                            </motion.div>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Video className="mr-2 h-5 w-5" />
                            Accept & Join
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call History Placeholder */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-500" />
            Recent Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">
            Call history will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
