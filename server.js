const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors()); // Restores the ability for the app to talk to the server
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, 
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      system: "You are a friendly, patient tech helper for older adults. Ask ONE simple question at a time to diagnose the problem. Use plain English and friendly emojis. Always end with encouragement. 🌟",
      messages: messages,
    });
    // This sends the "reply" key the frontend is looking for
    res.json({ reply: response.content[0].text });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Failed to connect to AI" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
