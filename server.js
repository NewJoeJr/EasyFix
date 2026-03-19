const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => res.send("EasyFix Backend: Operational ✅"));

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // Personality change: Focused, professional, and direct.
      systemInstruction: "You are a professional technical support specialist. Your goal is to diagnose and resolve the user's technology issues efficiently. Use clear, concise language. Avoid unnecessary small talk. Ask specific diagnostic questions one at a time to identify the root cause. Focus on step-by-step resolution.",
    });

    // --- FIX FOR CHAT HISTORY CRASHES ---
    // Gemini requires alternating 'user' and 'model' roles. 
    // We filter out any messages that don't fit this pattern.
    const cleanHistory = messages.slice(0, -1).map(m => {
      const role = (m.role === "bot" || m.role === "assistant" || m.role === "model") ? "model" : "user";
      const text = m.text || m.content || "";
      return { role, parts: [{ text: String(text) }] };
    }).filter(m => m.parts[0].text.trim() !== "");

    const lastMsg = messages[messages.length - 1];
    const lastText = String(lastMsg.text || lastMsg.content || "");

    const chat = model.startChat({ history: cleanHistory });
    const result = await chat.sendMessage(lastText);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error("Technical Error:", error);
    res.status(500).json({ error: "System error: Unable to process request." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`EasyFix Server active on port ${PORT}`));
