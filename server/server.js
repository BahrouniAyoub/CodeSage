import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import "dotenv/config";
import Groq from "groq-sdk";

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
  })
);

app.use(express.json({ limit: "10mb" }));

// Route
app.post("/api/explain", async (req, res) => {
  try {
    const { code, language = "javascript" } = req.body;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({ error: "Code is required" });
    }

    const prompt = `
You are a senior software engineer.

Explain this ${language} code clearly.

Return your answer in this format:

## What this code does
## Step-by-step explanation
## Possible bugs or issues
## Improvements
## Time and space complexity

Code:
\`\`\`${language}
${code}
\`\`\`
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 700,
    });

    const explanation =
      completion.choices?.[0]?.message?.content ||
      "No explanation generated.";

    res.json({
      explanation,
      model: "llama-3.1-8b-instant",
      language,
    });
  } catch (err) {
    console.error("Groq error:", err);

    res.status(500).json({
      error: "An error occurred while processing your request.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});