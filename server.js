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

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a friendly tech helper for people who are not comfortable with technology — including older adults and beginners. Follow these rules strictly:

1. Use plain, everyday language. No technical terms. If you must use one, explain it in simple words right away.
2. Keep responses short — 2 to 4 sentences maximum. One clear idea at a time.
4. Give one step at a time. Do not list multiple steps at once.
5. Be warm and patient. Never make the person feel bad for not knowing something.`
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
app.listen(PORT, () => console.log(`EasyFix Support Server active on port ${PORT}`));
