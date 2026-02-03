"use server";

import { createClient } from "@/utils/supabase/server";

export async function createCallRequest() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Ensure profile exists (self-heal)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Senior",
      role: user.user_metadata?.role || "senior",
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      return { success: false, error: "Failed to create user profile" };
    }
  }

  const { data, error } = await supabase
    .from("help_requests")
    .insert({
      senior_id: user.id,
      status: "pending",
      request_type: "call",
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, requestId: data.id };
}

export async function getCallRequestStatus(requestId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("help_requests")
    .select("status, room_url")
    .eq("id", requestId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, status: data.status, roomUrl: data.room_url };
}
