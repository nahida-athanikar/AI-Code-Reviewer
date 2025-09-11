const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const prompt = `
    Review the following ${language || "javascript"} code:

    ${code}

    Please follow the Senior Code Reviewer guidelines.
    `;

    const review = await aiService(prompt);

    // Return review directly, not wrapped
    res.json(review);

  } catch (error) {
    console.error("Error in getReview:", error);
    res.status(500).json({ error: "Something went wrong while reviewing code." });
  }
};
