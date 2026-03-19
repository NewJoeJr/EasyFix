const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini with your new Free API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("EasyFix Gemini Server is Running! ✅");
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // UPDATED: Using the latest stable model alias
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", // Updated from 1.5 to 2.5
      systemInstruction: "You are a friendly, patient tech helper for older adults. Ask ONE simple question at a time. Use plain English and emojis. 🌟",
    });

    // Convert messages for Gemini format
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === "assistant" || m.role === "bot" ? "model" : "user",
      parts: [{ text: m.content || m.text }],
    }));

    const lastMessage = messages[messages.length - 1].content || messages[messages.length - 1].text;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    // If 404 persists, the model name might have changed again
    res.status(500).json({ error: "AI is currently resting. Please try again! 😴" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
