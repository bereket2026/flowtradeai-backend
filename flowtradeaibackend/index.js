const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "FlowTradeAI backend is running"
  });
});

app.post("/ai", (req, res) => {
  const answers = [
    "Market shows mixed momentum. Wait for confirmation.",
    "Bullish trend detected, but manage risk carefully.",
    "High volatility today. Small positions recommended.",
    "Sideways market. No clear entry signal.",
    "Possible trend reversal near support levels."
  ];

  const reply = answers[Math.floor(Math.random() * answers.length)];

  res.json({ ai: reply });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("FlowTradeAI backend running on port " + PORT);
});
