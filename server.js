const express = require("express");
const cors = require("cors");
const OpenAI = require("openai"); // Groq uses the OpenAI format
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { 
          role: "system", 
          content: "You are a professional technical support specialist. Diagnose and resolve issues efficiently. Use direct language. Ask ONE diagnostic question at a time. No small talk." 
        },
        ...messages
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "System overloaded. Try again." });
  }
});

app.listen(10000, () => console.log("Groq Server Live"));
