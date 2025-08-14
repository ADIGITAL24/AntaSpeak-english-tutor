import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*"
}));
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-1.5-flash"}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `Tu es un tuteur d'anglais pour francophones. Explique en français avec des exemples simples. Question de l'apprenant: ${message}` }]
          }
        ]
      })
    });

    const data = await geminiRes.json();
    res.json({ reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || "Je n'ai pas pu répondre." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
