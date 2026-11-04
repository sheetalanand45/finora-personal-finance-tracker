const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const auth = require("../middleware/auth");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/insights", auth, async (req, res) => {
  try {
    const { income, expenses, budget, balance, categories } = req.body;

    const response = await openai.responses.create({
      model: "gpt-5.5",
      instructions:
        "You are Finora, a helpful personal finance assistant. Give concise, practical spending insights based only on the supplied figures. Do not invent transactions or provide investment, tax, or legal advice. Use clear bullet points.",
      input: JSON.stringify({
        monthlyIncome: income,
        monthlyExpenses: expenses,
        monthlyBudget: budget,
        monthlyBalance: balance,
        expenseCategories: categories,
      }),
    });

    res.json({ success: true, insights: response.output_text });
  } catch (error) {
    console.error("AI insights error:", error);
    res.status(500).json({
      success: false,
      message: "Could not generate AI insights.",
    });
  }
});

module.exports = router;