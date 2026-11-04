const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/budget", require("./routes/budget"));
app.use("/api/ai", require("./routes/ai"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the FinAI API!",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FinAI backend is running successfully.",
  });
});

const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`FinAI server running on port ${PORT}`);
  });
};

startServer();
