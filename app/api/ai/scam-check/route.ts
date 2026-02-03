import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are a scam detection expert helping elderly users in India identify fraudulent messages.

Analyze the following text for scam/phishing indicators:
- Urgency tactics ("act now", "limited time", "account will be blocked")
- Requests for OTP, PIN, passwords, or bank details
- Suspicious links or phone numbers
- Too-good-to-be-true offers (lottery wins, free money)
- Impersonation of banks, government, or companies
- Poor grammar or spelling (common in scams)
- Threats or fear tactics

TEXT TO ANALYZE:
"${text}"

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "is_danger": true or false,
  "reason_english": "Brief explanation in simple English (2-3 sentences max)",
  "reason_tamil": "Same explanation in Tamil (தமிழில் விளக்கம்)"
}

If the message appears to be a scam, set is_danger to true. If it seems safe or is normal conversation, set is_danger to false.`;

    let responseText = "";
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      responseText = response.text();
    } catch (aiError) {
      console.error("Gemini API error:", aiError);
      return NextResponse.json({
        is_danger: false,
        reason_english: "I am having trouble connecting, but I am here to help. Please be cautious.",
        reason_tamil: "இணைய சேவையில் சிக்கல் உள்ளது, ஆனால் நான் உதவ தயாராக இருக்கிறேன். தயவுசெய்து கவனமாக இருங்கள்.",
      });
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      // Clean the response - remove any markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch {
      // Fallback response if parsing fails
      console.error("Failed to parse AI response:", responseText);
      parsedResponse = {
        is_danger: false,
        reason_english: "Could not analyze. Please be cautious and verify with someone you trust.",
        reason_tamil: "பகுப்பாய்வு செய்ய முடியவில்லை. கவனமாக இருங்கள், நம்பகமான நபரிடம் சரிபார்க்கவும்.",
      };
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Scam check API error:", error);
    return NextResponse.json(
      {
        is_danger: false,
        reason_english: "Service temporarily unavailable. Please try again.",
        reason_tamil: "சேவை தற்காலிகமாக கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.",
      },
      { status: 500 }
    );
  }
}
