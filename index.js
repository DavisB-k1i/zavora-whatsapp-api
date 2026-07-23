const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Read environment variables (set in Render dashboard)
const { VERIFY_TOKEN, PHONE_NUMBER_ID, WHATSAPP_TOKEN } = process.env;

// Fail fast if required variables are missing
if (!VERIFY_TOKEN || !PHONE_NUMBER_ID || !WHATSAPP_TOKEN) {
    console.error("❌ Missing required environment variables:");
    console.error("   - VERIFY_TOKEN");
    console.error("   - PHONE_NUMBER_ID");
    console.error("   - WHATSAPP_TOKEN");
    process.exit(1);
}

// ---------- Webhook verification (GET) ----------
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
});

// ---------- Incoming WhatsApp events (POST) ----------
app.post("/webhook", (req, res) => {
    console.log("📨 Incoming WhatsApp Event:");
    console.log(JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

// ---------- Test endpoint to send a message ----------
app.get("/send", async (req, res) => {
    // Optional query param ?to=...  (default to your test number)
    const to = req.query.to || "256774724554";

    try {
        const response = await axios.post(
            `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: {
                    body: "🎉 Hello from Zavora Digital Solutions. WhatsApp API is working!"
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error("❌ Send error:", error.response?.data || error.message);
        res.status(500).json(
            error.response?.data || { error: error.message }
        );
    }
});

// ---------- Start server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Zavora WhatsApp server running on port ${PORT}`);
});
