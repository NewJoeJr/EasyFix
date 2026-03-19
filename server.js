const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors()); // Allows your website to talk to this server
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Set this in Render Dashboard
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      // This defines the AI's personality
      system: "You are a very friendly, patient tech helper for older adults. Your goal is to help them solve tech issues without using jargon. Ask ONE simple question at a time to diagnose the problem. Be encouraging and use friendly emojis. Never make them feel overwhelmed.",
      messages: messages,
    });

    // Send only the text back to your app
    res.json({ reply: response.content[0].text });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to connect to AI" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
