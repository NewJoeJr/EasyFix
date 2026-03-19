const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini with your new key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("EasyFix Gemini Server is Running! ✅");
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Pick the free-tier model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are a friendly, patient tech helper for older adults. Ask ONE simple question at a time. Use plain English and friendly emojis. 🌟",
    });

    // Convert the message format for Gemini
    const lastMessage = messages[messages.length - 1].content;
    
    const result = await model.generateContent(lastMessage);
    const response = await result.response;
    const text = response.text();

    // Sends back the 'reply' key just like before
    res.json({ reply: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Free AI is currently busy. Try again!" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
