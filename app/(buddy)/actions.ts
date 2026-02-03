"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function verifyBuddy(): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return;
  }

  // Get current profile to preserve existing context_data
  const { data: profile } = await supabase
    .from("profiles")
    .select("context_data")
    .eq("id", user.id)
    .single();

  const currentContextData = (profile?.context_data as Record<string, unknown>) || {};

  // Update context_data with verified: true
  await supabase
    .from("profiles")
    .update({ 
      context_data: {
        ...currentContextData,
        verified: true
      }
    })
    .eq("id", user.id);

  revalidatePath("/buddy/profile");
}

export async function toggleBuddyAvailability(): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return;
  }

  // Get current availability status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_available")
    .eq("id", user.id)
    .single();

  const newStatus = !(profile?.is_available ?? false);

  // Update availability
  await supabase
    .from("profiles")
    .update({ is_available: newStatus })
    .eq("id", user.id);

  revalidatePath("/buddy/profile");
}

export async function acceptHelpRequest(requestId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("help_requests")
    .update({ 
      status: "accepted",
      buddy_id: user.id,
      accepted_at: new Date().toISOString()
    })
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) {
    console.error("Error accepting help request:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/buddy/dashboard");
  return { success: true };
}

export async function getPendingRequests() {
  const supabase = await createClient();
  
  const { data: requests, error } = await supabase
    .from("help_requests")
    .select(`
      *,
      profiles:senior_id (
        full_name,
        context_data
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching requests:", error);
    return [];
  }

  return requests || [];
}

export async function getRecentRequests() {
  const supabase = await createClient();
  
  const { data: requests, error } = await supabase
    .from("help_requests")
    .select(`
      *,
      profiles:senior_id (
        full_name,
        context_data
      )
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching requests:", error);
    return [];
  }

  return requests || [];
}
