const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();

// 1. This line MUST be here to stop the "Connection Error"
app.use(cors()); 
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, 
});

// The "Home" route you just tested
app.get("/", (req, res) => {
  res.send("EasyFix Server is Running! ✅");
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    
    // 2. Check your Render Logs. If this fails, your API Key is likely missing in Render Settings.
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      system: "You are a friendly, patient tech helper for older adults. Ask ONE simple question at a time. Use plain English and emojis. 🌟",
      messages: messages,
    });

    res.json({ reply: response.content[0].text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI failed" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running`));
