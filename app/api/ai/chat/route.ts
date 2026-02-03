import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini with API key validation
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Graceful fallback response
const FALLBACK_RESPONSE = {
  text: "I am having trouble connecting, but I am here to help. Please try again in a moment, or contact a family member if this is urgent."
};

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // 2. Check API key availability
    if (!genAI || !apiKey) {
      console.warn("GOOGLE_GEMINI_API_KEY not configured");
      return NextResponse.json(FALLBACK_RESPONSE, { status: 200 });
    }

    // 3. Initialize model with STABLE version (Fix for 404 error)
    // Using gemini-1.5-flash-latest as primary, with gemini-pro as fallback
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    } catch {
      // Fallback to gemini-pro if flash is unavailable
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    // 4. Build the prompt with senior-friendly system instructions
    const systemPrompt = `You are a kind, patient assistant helping seniors with technology and daily life.

IMPORTANT RULES:
1. Keep answers SHORT (2-3 sentences maximum).
2. Use SIMPLE, clear language - no jargon.
3. Be WARM and reassuring in tone.
4. If anything sounds like a SCAM ("you won a prize", "pay immediately", "share OTP"), WARN them clearly.
5. For MEDICAL emergencies: "Please call emergency services or go to the nearest hospital immediately."
6. For BANKING issues: "Please visit your bank in person or call their official helpline."

Senior's Question: "${message}"`;

    // 5. Generate response with error handling
    try {
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim() === "") {
        return NextResponse.json(FALLBACK_RESPONSE, { status: 200 });
      }

      return NextResponse.json({ text });
    } catch (generationError) {
      // Handle specific Gemini API errors
      console.error("Gemini generation error:", generationError);
      return NextResponse.json(FALLBACK_RESPONSE, { status: 200 });
    }
    
  } catch (error) {
    // Top-level catch for any unexpected errors
    console.error("AI Route Error:", error);
    return NextResponse.json(FALLBACK_RESPONSE, { status: 200 });
  }
}
