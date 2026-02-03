"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createHelpRequest() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Self-healing: Check if profile exists, create if missing
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!existingProfile) {
    // Profile missing - create it on the fly
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      role: "senior",
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Error creating missing profile:", profileError);
      return { success: false, error: "Failed to create user profile" };
    }
  }

  const { error } = await supabase.from("help_requests").insert({
    senior_id: user.id,
    status: "pending",
    request_type: "sos",
    priority: "urgent",
  });

  if (error) {
    console.error("Error creating help request:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/buddy/dashboard");
  return { success: true };
}

// Alias for SOS functionality
export async function createSOSRequest() {
  return createHelpRequest();
}

export async function getUserProfile() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
