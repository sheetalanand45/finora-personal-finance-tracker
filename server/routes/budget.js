const express = require("express");
const Budget = require("../models/Budget");
const auth = require("../middleware/auth");

const router = express.Router();

// Get the logged-in user's budget
router.get("/", auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({ user: req.userId });

    res.json({
      success: true,
      budget: budget ? budget.amount : 0,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch budget.",
    });
  }
});

// Create or update the logged-in user's budget
router.put("/", auth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Budget must be a valid non-negative number.",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.userId },
      { amount },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    res.json({ success: true, budget: budget.amount });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not save budget.",
    });
  }
});

module.exports = router;