"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { acceptHelpRequest, getPendingRequests, getRecentRequests } from "../../actions";

interface HelpRequest {
  id: string;
  senior_id: string;
  status: string;
  request_type: string;
  created_at: string;
  profiles?: {
    full_name: string;
    context_data: Record<string, unknown>;
  };
}

// Notification sound using Web Audio API
function playNotificationSound() {
  if (typeof window === "undefined") return;
  
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log("Could not play notification sound:", e);
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="destructive" className="bg-amber-500 text-white">Pending</Badge>;
    case "accepted":
      return <Badge variant="default" className="bg-blue-500 text-white">Accepted</Badge>;
    case "resolved":
      return <Badge variant="default" className="bg-green-500 text-white">Resolved</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function PendingRequestsTable() {
  const [pendingRequests, setPendingRequests] = useState<HelpRequest[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const pending = await getPendingRequests();
      setPendingRequests(pending);
    };
    loadData();
  }, []);

  // Real-time subscription for new help requests
  useEffect(() => {
    const channel = supabase
      .channel("help-requests-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "help_requests",
        },
        async () => {
          playNotificationSound();
          setNotification("🚨 New help request received!");
          setTimeout(() => setNotification(null), 5000);
          
          const pending = await getPendingRequests();
          setPendingRequests(pending);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "help_requests",
        },
        async () => {
          const pending = await getPendingRequests();
          setPendingRequests(pending);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAccept = (requestId: string) => {
    startTransition(async () => {
      const result = await acceptHelpRequest(requestId);
      if (result.success) {
        const pending = await getPendingRequests();
        setPendingRequests(pending);
      }
    });
  };

  return (
    <>
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">{notification}</span>
          </div>
        </div>
      )}

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Pending Help Requests
          </CardTitle>
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="bg-red-500 animate-pulse text-white">
              {pendingRequests.length} Waiting
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending requests. All caught up! 🎉</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-300">Senior</TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
                  <TableHead className="text-slate-300">Time</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-right text-slate-300">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="font-medium text-slate-100">
                      {request.profiles?.full_name || "Unknown Senior"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-red-500 text-red-400">
                        {request.request_type === "sos" ? "🚨 SOS" : request.request_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {formatTime(request.created_at)}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(request.id)}
                        disabled={isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Accept
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export function RecentActivityTable() {
  const [recentRequests, setRecentRequests] = useState<HelpRequest[]>([]);
  const supabase = createClient();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const recent = await getRecentRequests();
      setRecentRequests(recent);
    };
    loadData();
  }, []);

  // Real-time subscription for updates
  useEffect(() => {
    const channel = supabase
      .channel("recent-activity-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "help_requests",
        },
        async () => {
          const recent = await getRecentRequests();
          setRecentRequests(recent);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentRequests.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No recent activity</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-300">Senior</TableHead>
                <TableHead className="text-slate-300">Type</TableHead>
                <TableHead className="text-slate-300">Time</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRequests.slice(0, 10).map((request) => (
                <TableRow key={request.id} className="border-slate-800">
                  <TableCell className="font-medium text-slate-100">
                    {request.profiles?.full_name || "Unknown Senior"}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {request.request_type}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {formatTime(request.created_at)}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
