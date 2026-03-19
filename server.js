const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.get("/health", (req, res) => {
  res.json({ status: "SimpleGuard backend is running!" });
});

app.post("/chat", async (req, res) => {
  const { messages, topic } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const systemPrompt = topic
    ? `You are a very friendly, patient tech helper for older adults and people who are not comfortable with technology. The user is asking about this specific problem: "${topic}". Give simple, calming, easy-to-follow answers. Use plain English, no jargon. Number any steps clearly (Step 1, Step 2, etc.). Keep steps SHORT - one action per step. Use friendly emojis. Never make the person feel stupid. Keep responses to 5 steps max. End with a reassuring note.`
    : `You are a very friendly, patient tech helper for older adults and people who are not comfortable with technology. Give simple, calming, easy-to-follow solutions to everyday tech problems. Use plain English, no jargon. Number each step clearly (Step 1, Step 2, etc.). Keep steps SHORT - one action per step. Use friendly emojis. Ask only ONE clarifying question at a time. Never make the person feel stupid. Keep responses to 5 steps max. End with a reassuring note.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.content?.find((b) => b.type === "text")?.text;
    res.json({ reply });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Failed to reach AI. Please try again." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SimpleGuard backend running on port ${PORT}`);
});
