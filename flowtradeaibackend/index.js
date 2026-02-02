const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ====== STATE ======
let prices = [];
let position = null;
let entryPrice = null;
let tradeHistory = [];

// ====== RSI FUNCTION ======
function calculateRSI(values, period = 14) {
  if (values.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = values.length - period; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  if (losses === 0) return 100;

  const rs = gains / losses;
  return Math.round(100 - 100 / (1 + rs));
}

// ====== HOME ======
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "FlowTradeAI backend with RSI is running"
  });
});

// ====== AI ENDPOINT ======
app.post("/ai", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    const data = await response.json();
    const price = data.bitcoin.usd;

    prices.push(price);
    if (prices.length > 100) prices.shift();

    const rsi = calculateRSI(prices);

    let signal = "HOLD";
    let confidence = 50;
    let explanation = "Market neutral.";

    if (rsi !== null) {
      if (rsi < 30) {
        signal = "BUY";
        confidence = 75;
        explanation = `RSI ${rsi} indicates oversold conditions.`;
      } else if (rsi > 70) {
        signal = "SELL";
        confidence = 78;
        explanation = `RSI ${rsi} indicates overbought conditions.`;
      } else {
        explanation = `RSI ${rsi} is neutral.`;
      }
    }

    // ====== PAPER TRADING ======
    if (signal === "BUY" && position !== "LONG") {
      position = "LONG";
      entryPrice = price;
      tradeHistory.push({
        time: new Date().toLocaleString(),
        action: "BUY",
        price
      });
    }

    if (signal === "SELL" && position === "LONG") {
      const pnl = (((price - entryPrice) / entryPrice) * 100).toFixed(2);
      tradeHistory.push({
        time: new Date().toLocaleString(),
        action: "SELL",
        price,
        pnl
      });
      position = null;
      entryPrice = null;
    }

    let pnl = null;
    if (position === "LONG" && entryPrice) {
      pnl = (((price - entryPrice) / entryPrice) * 100).toFixed(2);
    }

    res.json({
      price,
      rsi,
      signal,
      confidence,
      position: position || "NONE",
      entryPrice,
      pnl,
      explanation,
      history: tradeHistory.slice(-10)
    });

  } catch (err) {
    res.json({
      signal: "HOLD",
      confidence: 40,
      explanation: "Market data unavailable."
    });
  }
});

// ====== START ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("FlowTradeAI backend with RSI running on port " + PORT);
});
