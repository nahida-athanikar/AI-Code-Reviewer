// ai.service.js
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_KEY,
});

async function generateContent(prompt) {
  let attempts = 0;
  const maxRetries = 3;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const systemInstruction = `
You are a **Senior Code Reviewer (7+ years of experience)**. 
Your task is to **analyze and review code in ANY programming language**. 
Always auto-detect the language — do not assume JavaScript unless it is clearly JavaScript.

### Responsibilities:
- Ensure **code quality, readability, maintainability**.
- Suggest **best practices** and **modern improvements**.
- Identify **bugs, errors, or security risks**.
- Check for **performance optimizations** and **scalability**.
- Point out **style or consistency issues** (naming, formatting, DRY, SOLID, etc.).

+ Format your review in **Markdown** using this structure:
+
+ ## 🔎 What this code does
+ - (1–2 lines, beginner-friendly)
+
+ ## 💡 Suggestions for Improvement
+ - Suggestion 1
+ - Suggestion 2
+
+ ## ❌ Bad / Current Code
+ \`\`\`language
+ // bad code here
+ \`\`\`
+
+ ## ✅ Corrected / Improved Code
+ \`\`\`language
+ // improved code here
+ \`\`\`

### Tone:
- Professional but encouraging. 
- Concise (max 10 lines total).
- Highlight strengths too, not just weaknesses.

---
Now review the following code:
\`\`\`
${prompt}
\`\`\`
`;

  while (attempts < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: systemInstruction }] }],
      });

      // Extract AI text safely
      let text = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return text.trim();

    } catch (err) {
      attempts++;
      console.error(`🔥 AI API Error (Attempt ${attempts}):`, err.message);

      if (
        (err.message.includes("overloaded") ||
          err.message.includes("UNAVAILABLE")) &&
        attempts < maxRetries
      ) {
        console.log("⏳ Retrying in 2s...");
        await delay(2000);
        continue;
      }

      // Final fallback
      return "⚠️ Unable to fetch review at the moment. Please try again later.";
    }
  }
}

module.exports = generateContent;
