require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Receive WhatsApp events
app.post("/webhook", (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// Send a test WhatsApp message
app.get("/send", async (req, res) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v23.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: "256774724554", // Replace with your phone number
        type: "text",
        text: {
          body: "🎉 Hello! Your Zavora WhatsApp API is working."
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json(error.response?.data || { error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
