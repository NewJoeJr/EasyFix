const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => res.send("EasyFix Technical Support: Operational ✅"));

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // Using gemini-2.0-flash (Stable and high-quota for 2026)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash", 
      systemInstruction: "You are a professional technical support specialist. Diagnose and resolve technology issues efficiently. Use direct, clear language. Ask ONE diagnostic question at a time. No small talk or emojis.",
    });

    // --- THE STRICTOR HISTORY CLEANER ---
    let lastRole = null;
    const history = [];

    messages.slice(0, -1).forEach(m => {
      // Map any role to either 'user' or 'model'
      const currentRole = (m.role === "bot" || m.role === "assistant" || m.role === "model") ? "model" : "user";
      
      // RULE: History must START with 'user' and then ALTERNATE.
      if ((history.length === 0 && currentRole === "user") || (history.length > 0 && currentRole !== lastRole)) {
        history.push({
          role: currentRole,
          parts: [{ text: String(m.text || m.content || " ") }]
        });
        lastRole = currentRole;
      }
    });

    const lastMsg = messages[messages.length - 1];
    const lastText = String(lastMsg.text || lastMsg.content || "Requesting technical assistance.");

    // Start chat with the perfectly alternating history
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastText);
    
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Technical Support Error:", error);
    // Professional error message for the end user
    res.status(500).json({ error: "System error: The technical support module is temporarily unavailable." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Professional Server active on port ${PORT}`));
