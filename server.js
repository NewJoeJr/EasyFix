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

    // Use gemini-2.0-flash (Stable for 2026)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash", 
      systemInstruction: "You are a professional technical support specialist. Diagnose and resolve technology issues efficiently. Use direct, clear language. Ask ONE diagnostic question at a time. Focus on step-by-step resolution.",
    });

    // --- THE CHAT FIX: ENSURING ALTERNATING ROLES ---
    let lastRole = null;
    const history = [];

    // We loop through messages and only keep them if they follow the User -> Model pattern
    messages.slice(0, -1).forEach(m => {
      const currentRole = (m.role === "bot" || m.role === "assistant" || m.role === "model") ? "model" : "user";
      
      // 1. History MUST start with 'user'
      // 2. Roles MUST alternate (User -> Model -> User)
      if ((history.length === 0 && currentRole === "user") || (history.length > 0 && currentRole !== lastRole)) {
        history.push({
          role: currentRole,
          parts: [{ text: String(m.text || m.content || " ") }]
        });
        lastRole = currentRole;
      }
    });

    const lastMsg = messages[messages.length - 1];
    const lastText = String(lastMsg.text || lastMsg.content || "Please help.");

    // Start chat with the perfectly cleaned history
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastText);
    
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Technical Support Error:", error);
    res.status(500).json({ error: "System error: The support module encountered a processing conflict." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Professional Server active on port ${PORT}`));
