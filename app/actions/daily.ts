"use server";

import { createClient } from "@/utils/supabase/server";

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = "https://api.daily.co/v1";

export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  created_at: string;
  config: {
    exp?: number;
    nbf?: number;
  };
}

export interface CreateRoomResult {
  success: boolean;
  room?: DailyRoom;
  error?: string;
}

/**
 * Creates a new Daily.co video call room
 */
export async function createCallRoom(
  seniorId?: string,
  buddyId?: string
): Promise<CreateRoomResult> {
  if (!DAILY_API_KEY) {
    console.error("Daily.co API key not configured");
    return {
      success: false,
      error: "Video calls are not configured. Please contact support.",
    };
  }

  try {
    // Generate a unique room name
    const roomName = `bridge-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Room expires in 1 hour
    const expirationTime = Math.floor(Date.now() / 1000) + 3600;

    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "private",
        properties: {
          exp: expirationTime,
          enable_chat: true,
          enable_screenshare: false,
          start_video_off: false,
          start_audio_off: false,
          max_participants: 2,
          enable_knocking: false,
          enable_prejoin_ui: false,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Daily.co API error:", errorData);
      return {
        success: false,
        error: "Failed to create video room. Please try again.",
      };
    }

    const room: DailyRoom = await response.json();

    // Store call session in Supabase if IDs provided
    if (seniorId || buddyId) {
      const supabase = await createClient();
      if (supabase) {
        await supabase.from("call_sessions").insert({
          room_name: room.name,
          room_url: room.url,
          senior_id: seniorId,
          buddy_id: buddyId,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: new Date(expirationTime * 1000).toISOString(),
        });
      }
    }

    return {
      success: true,
      room,
    };
  } catch (error) {
    console.error("Error creating Daily room:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Ends a Daily.co video call room
 */
export async function endCallRoom(roomName: string): Promise<{ success: boolean; error?: string }> {
  if (!DAILY_API_KEY) {
    return { success: false, error: "Daily.co not configured" };
  }

  try {
    // Delete the room from Daily.co
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      return { success: false, error: "Failed to end call" };
    }

    // Update Supabase
    const supabase = await createClient();
    if (supabase) {
      await supabase
        .from("call_sessions")
        .update({ 
          status: "ended",
          ended_at: new Date().toISOString()
        })
        .eq("room_name", roomName);
    }

    return { success: true };
  } catch (error) {
    console.error("Error ending call:", error);
    return { success: false, error: "Failed to end call" };
  }
}

/**
 * Gets an active call room for a help request
 */
export async function getCallRoomForRequest(requestId: string): Promise<CreateRoomResult> {
  const supabase = await createClient();
  if (!supabase) {
    return { success: false, error: "Database not available" };
  }

  // Check if there's already an active session
  const { data: existingSession } = await supabase
    .from("call_sessions")
    .select("*")
    .eq("help_request_id", requestId)
    .eq("status", "active")
    .single();

  if (existingSession) {
    return {
      success: true,
      room: {
        id: existingSession.id,
        name: existingSession.room_name,
        url: existingSession.room_url,
        created_at: existingSession.started_at,
        config: {},
      },
    };
  }

  // Create a new room if none exists
  return createCallRoom();
}

/**
 * Accepts a help request and creates a call room for it
 */
export async function acceptRequestAndCreateCall(
  requestId: string,
  buddyId: string
): Promise<CreateRoomResult> {
  const supabase = await createClient();
  if (!supabase) {
    return { success: false, error: "Database not available" };
  }

  // Get the help request details
  const { data: request, error: requestError } = await supabase
    .from("help_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    return { success: false, error: "Request not found" };
  }

  // Create the call room
  const roomResult = await createCallRoom(request.senior_id, buddyId);
  if (!roomResult.success) {
    return roomResult;
  }

  // Update the help request with the call URL
  await supabase
    .from("help_requests")
    .update({
      status: "in_call",
      buddy_id: buddyId,
      call_url: roomResult.room?.url,
      accepted_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  // Link call session to help request
  if (roomResult.room) {
    await supabase
      .from("call_sessions")
      .update({ help_request_id: requestId })
      .eq("room_name", roomResult.room.name);
  }

  return roomResult;
}
