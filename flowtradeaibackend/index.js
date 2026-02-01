const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let lastBTCPrice = null;

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "FlowTradeAI backend with signals is running"
  });
});

app.post("/ai", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    const data = await response.json();
    const price = data.bitcoin.usd;

    let signal = "HOLD";
    let confidence = 50;
    let reason = "Market is stabilizing.";

    if (lastBTCPrice !== null) {
      if (price > lastBTCPrice) {
        signal = "BUY";
        confidence = 70;
        reason = "BTC price increased compared to previous data.";
      } else if (price < lastBTCPrice) {
        signal = "SELL";
        confidence = 70;
        reason = "BTC price decreased compared to previous data.";
      }
    }

    lastBTCPrice = price;

    res.json({
      signal,
      confidence,
      price,
      explanation: reason
    });
  } catch {
    res.json({
      signal: "HOLD",
      confidence: 40,
      explanation: "Market data unavailable."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("FlowTradeAI signal backend running on port " + PORT);
});
