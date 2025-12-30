import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    // *** USING THE MODEL FROM YOUR LIST ***
    const modelName = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    console.log(`Asking ${modelName}...`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Explain this simply to a student: ${prompt}` }] 
        }]
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Google API Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return NextResponse.json({ answer: text });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}