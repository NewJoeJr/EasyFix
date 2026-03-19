const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => res.send("EasyFix Technical Support: Backend Online ✅"));

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // Latest stable model as of March 2026 to avoid 404 errors
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: "You are a professional technical support specialist. Your goal is to diagnose and resolve technology issues. Use direct, clear language. Ask specific diagnostic questions one at a time. Focus on efficient, step-by-step resolution without unnecessary small talk.",
    });

    // --- MANDATORY CHAT HISTORY FORMATTING ---
    // Gemini history must alternate User -> Model. This code ensures that pattern.
    const history = messages.slice(0, -1).map(m => ({
      role: (m.role === "bot" || m.role === "assistant" || m.role === "model") ? "model" : "user",
      parts: [{ text: String(m.text || m.content || "") }],
    })).filter(m => m.parts[0].text.trim() !== "");

    const currentMsg = messages[messages.length - 1];
    const currentText = String(currentMsg.text || currentMsg.content || "");

    // Start session and send message
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(currentText);
    
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Technical Support Error:", error);
    res.status(500).json({ error: "System error: The support module encountered an issue." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Technical Support Server running`));
