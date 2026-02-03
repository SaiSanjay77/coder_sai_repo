import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

interface MonitorRequest {
  text: string;
  sessionId?: string;
}

interface ThreatAnalysis {
  safe: boolean;
  reason: string;
  confidence: number;
  threatType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: MonitorRequest = await request.json();
    const { text, sessionId } = body;

    if (!text || text.trim().length < 5) {
      return NextResponse.json({ safe: true, reason: "Insufficient text" });
    }

    // Skip if text is too short to analyze meaningfully
    if (text.trim().length < 20) {
      return NextResponse.json({ safe: true, reason: "Text too short" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an AI safety monitor protecting elderly users from phone scams and fraud.

Analyze the following conversation text for potential threats:

TEXT: "${text}"

Common scam patterns to detect:
1. Urgency/pressure tactics ("act now", "limited time", "immediate action required")
2. Requests for money, gift cards, or wire transfers
3. Requests for personal information (SSN, bank details, passwords)
4. Impersonation of government agencies (IRS, Social Security, Medicare)
5. Tech support scams ("your computer has a virus")
6. Lottery/prize scams ("you've won")
7. Grandparent scams (pretending to be a relative in trouble)
8. Romance scams (emotional manipulation for money)
9. Threats of arrest, legal action, or account suspension
10. Requests to keep things secret from family

Respond with ONLY a JSON object (no markdown, no code blocks):
{
  "safe": true/false,
  "reason": "Brief explanation if threat detected",
  "confidence": 0.0-1.0,
  "threatType": "one of: urgency, money_request, personal_info, impersonation, tech_support, lottery, grandparent, romance, threats, secrecy, other"
}

If the conversation seems normal and safe, return:
{"safe": true, "reason": "No threats detected", "confidence": 0.9}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Parse the JSON response
    let analysis: ThreatAnalysis;
    try {
      // Clean up the response (remove any markdown if present)
      const cleanJson = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      analysis = JSON.parse(cleanJson);
    } catch {
      // If parsing fails, assume safe
      console.error("Failed to parse AI response:", responseText);
      analysis = { safe: true, reason: "Analysis inconclusive", confidence: 0.5 };
    }

    // If threat detected and session ID provided, log to database
    if (!analysis.safe && sessionId) {
      try {
        const supabase = await createClient();
        if (supabase) {
          await supabase.from("danger_alerts").insert({
            call_session_id: sessionId,
            detected_text: text.slice(0, 500), // Limit stored text
            reason: analysis.reason,
            threat_type: analysis.threatType || "unknown",
            confidence: analysis.confidence,
            created_at: new Date().toISOString(),
          });
        }
      } catch (dbError) {
        console.error("Failed to log alert to database:", dbError);
        // Continue even if database logging fails
      }
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI Monitor error:", error);
    // On error, err on the side of caution but don't block
    return NextResponse.json({
      safe: true,
      reason: "Analysis unavailable",
      confidence: 0,
    });
  }
}
