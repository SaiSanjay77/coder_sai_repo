"use server";

import { createClient } from "@/utils/supabase/server";

export interface Reminder {
  id: string;
  user_id: string;
  medicine_name: string;
  dosage: string | null;
  time: string; // HH:mm format
  days: string[]; // ["monday", "tuesday", etc.]
  is_active: boolean;
  created_at: string;
}

/**
 * Get all reminders for the current user
 */
export async function getReminders(): Promise<Reminder[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("medicine_reminders")
    .select("*")
    .eq("user_id", user.id)
    .order("time", { ascending: true });

  if (error) {
    console.error("Error fetching reminders:", error);
    return [];
  }

  return data || [];
}

/**
 * Add a new medicine reminder
 */
export async function addReminder(
  medicineName: string,
  time: string,
  days: string[],
  dosage?: string
): Promise<{ success: boolean; error?: string; reminder?: Reminder }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("medicine_reminders")
    .insert({
      user_id: user.id,
      medicine_name: medicineName,
      dosage: dosage || null,
      time,
      days,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding reminder:", error);
    return { success: false, error: "Failed to add reminder" };
  }

  return { success: true, reminder: data };
}

/**
 * Delete a medicine reminder
 */
export async function deleteReminder(
  reminderId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("medicine_reminders")
    .delete()
    .eq("id", reminderId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting reminder:", error);
    return { success: false, error: "Failed to delete reminder" };
  }

  return { success: true };
}

/**
 * Toggle a reminder's active status
 */
export async function toggleReminder(
  reminderId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("medicine_reminders")
    .update({ is_active: isActive })
    .eq("id", reminderId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error toggling reminder:", error);
    return { success: false, error: "Failed to update reminder" };
  }

  return { success: true };
}
