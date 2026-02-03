"use server";

import { createClient } from "@/utils/supabase/server";

interface SignupData {
  email: string;
  password: string;
  fullName: string;
  role: string; // Accept any string, we'll sanitize it
  phone?: string;
  emergencyContact?: string;
  skills?: string;
}

interface SignupResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
  message?: string;
}

export async function signupAction(data: SignupData): Promise<SignupResult> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return {
        success: false,
        error: "Database connection not available. Please try again later.",
      };
    }

    // ============================================
    // STEP 1: SANITIZE THE ROLE
    // ============================================
    // If role contains "volunteer" (case insensitive), map to "buddy"
    // Otherwise, default to "senior"
    const inputRole = data.role?.toLowerCase().trim() || "";
    const safeRole: "senior" | "buddy" = 
      inputRole.includes("volunteer") || inputRole === "buddy" 
        ? "buddy" 
        : "senior";

    // ============================================
    // STEP 2: PACK CONTEXT DATA
    // ============================================
    // Build context_data object with skills and other extra fields
    const contextData: Record<string, string> = {};
    
    if (data.skills?.trim()) {
      contextData.skills = data.skills.trim();
    }
    
    if (data.phone?.trim()) {
      contextData.phone_number = data.phone.trim();
    }
    
    if (data.emergencyContact?.trim()) {
      contextData.emergency_contact = data.emergencyContact.trim();
    }

    // ============================================
    // STEP 3: CALL SUPABASE AUTH SIGNUP
    // ============================================
    // Pass everything in options.data for the SQL trigger to consume
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName?.trim() || "",
          role: safeRole,
          context_data: Object.keys(contextData).length > 0 ? contextData : null,
        },
      },
    });

    // ============================================
    // STEP 4: ERROR HANDLING
    // ============================================
    if (signUpError) {
      console.error("Supabase signup error:", {
        message: signUpError.message,
        status: signUpError.status,
        code: signUpError.code,
      });
      
      return {
        success: false,
        error: signUpError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to create user account. Please try again.",
      };
    }

    // ============================================
    // STEP 5: DETERMINE REDIRECT
    // ============================================
    // Check if email confirmation is required
    // If user.identities is empty, email confirmation is pending
    const needsEmailConfirmation = 
      authData.user.identities?.length === 0 || 
      !authData.session;

    if (needsEmailConfirmation) {
      // Email confirmation is ON - redirect to login with message
      return {
        success: true,
        redirectTo: "/login?message=Check your email to confirm your account",
        message: "Check your email to confirm your account before signing in.",
      };
    }

    // Auto-confirm is ON - redirect directly to dashboard
    return {
      success: true,
      redirectTo: `/${safeRole}/dashboard`,
    };

  } catch (err) {
    console.error("Unexpected signup error:", err);
    
    return {
      success: false,
      error: err instanceof Error 
        ? err.message 
        : "An unexpected error occurred. Please try again.",
    };
  }
}
