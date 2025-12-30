import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt;

    // 1. Get the Key from the Vercel Safe
    const apiKey = process.env.AIzaSyBJ_RSe9KFfNbrvXdULUMWOhPLR0xE69xg;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing." }, { status: 500 });
    }

    // 2. Connect to Google
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Generate the text
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to process AI request." }, { status: 500 });
  }
}