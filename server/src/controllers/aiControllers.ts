import { Request, Response } from "express";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Message is required" });
    }

    const normalizedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: Array.isArray(msg.parts) ? msg.parts.map((p: any) => p.text).join("\n") : msg.content || "",
    }));

    console.log("🔍 Normalized Messages:", normalizedMessages);

    // ✅ Correct way to use generateText with provider
    const aiResponse = await generateText({
      model: openai("gpt-4o-mini"), // or "gpt-4o"
      messages: normalizedMessages,
    });

    console.log("🧠 AI Response:", aiResponse.text || "(empty)");
    res.json({ response: aiResponse.text || "[no content returned]" });
  } catch (error: any) {
    console.error("❌ AI Error:", error.message || error);
    res.status(500).json({
      message: "Error communicating with AI service",
      error: error.message || error,
    });
  }
};
