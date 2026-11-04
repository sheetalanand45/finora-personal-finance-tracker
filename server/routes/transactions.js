const express = require("express");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

const router = express.Router();

// Get the logged-in user's transactions
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId })
      .sort({ date: -1, createdAt: -1 });

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch transactions." });
  }
});

// Add a transaction
router.post("/", auth, async (req, res) => {
  try {
    const { type, title, amount, category, date } = req.body;

    if (!["income", "expense"].includes(type) || !title || !category ||
        !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid type, title, positive amount, and category.",
      });
    }

    const transaction = await Transaction.create({
      user: req.userId,
      type,
      title,
      amount: Number(amount),
      category,
      date: date || new Date(),
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not save transaction." });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!deletedTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not delete transaction",
    });
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    const result = await Transaction.deleteMany({ user: req.userId });

    res.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not clear transactions",
    });
  }
});

module.exports = router;