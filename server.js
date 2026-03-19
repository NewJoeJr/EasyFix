const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => res.send("EasyFix Gemini Server is Running! ✅"));

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // Use the model you know is working
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Stick with 1.5 since it worked for topics!
      systemInstruction: "You are a friendly, patient tech helper for older adults. Ask ONE simple question at a time. Use plain English and emojis. 🌟",
    });

    // --- THE FIX: CLEAN THE HISTORY ---
    // Gemini is very picky: it needs 'user' or 'model' roles only.
    const cleanHistory = messages.slice(0, -1).map(m => ({
      role: m.role === "bot" || m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: String(m.text || m.content || "") }],
    })).filter(m => m.parts[0].text.length > 0); // Remove empty messages

    const lastMsg = messages[messages.length - 1];
    const lastText = String(lastMsg.text || lastMsg.content || "");

    // Start chat with cleaned history
    const chat = model.startChat({ history: cleanHistory });
    const result = await chat.sendMessage(lastText);
    
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "I'm having trouble thinking right now. 😴" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live`));
