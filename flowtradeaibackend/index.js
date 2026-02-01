const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let lastBTCPrice = null;

// Home check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "FlowTradeAI backend with smart AI is running"
  });
});

// AI endpoint
app.post("/ai", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    const data = await response.json();
    const currentPrice = data.bitcoin.usd;

    let insight = "";

    if (lastBTCPrice === null) {
      insight = "Market initializing. Collecting data for trend analysis.";
    } else if (currentPrice > lastBTCPrice) {
      insight =
        "Bullish momentum detected. BTC is moving upward with positive strength.";
    } else if (currentPrice < lastBTCPrice) {
      insight =
        "Bearish pressure observed. BTC price is declining. Risk management advised.";
    } else {
      insight =
        "Sideways movement detected. Market is consolidating with low momentum.";
    }

    lastBTCPrice = currentPrice;

    res.json({
      ai: insight,
      btc_price: currentPrice
    });
  } catch (error) {
    res.json({
      ai: "Market data temporarily unavailable. Please retry."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("FlowTradeAI smart backend running on port " + PORT);
});
