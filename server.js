const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq (Uses OpenAI format)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

app.get("/", (req, res) => res.send("EasyFix Technical Support: Operational ✅"));

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // Professional, serious system prompt
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { 
          role: "system", 
          content: "You are a professional technical support specialist. Your goal is to diagnose and resolve technology issues efficiently. Use direct, professional language. Ask specific diagnostic questions one at a time. Do not use emojis or small talk. Focus on step-by-step resolution." 
        },
        ...messages
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).json({ error: "System error: Technical support module unavailable." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Professional Support Server active on port ${PORT}`));
