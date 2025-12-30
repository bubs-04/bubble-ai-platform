import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    // 1. Get the prompt from the student
    const { prompt } = await req.json();
    
    // 2. Get the Secret Key from the "Safe" (Environment Variables)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    // 3. Connect to Google Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 4. Ask the question
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Send the answer back to the student
    return NextResponse.json({ result: text });
    
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}