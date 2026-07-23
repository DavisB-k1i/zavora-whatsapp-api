const express = require("express");

const app = express();

app.use(express.json());

const VERIFY_TOKEN = "zavora_secure_token_2026";

// Meta webhook verification
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Receive WhatsApp messages
app.post("/webhook", (req, res) => {
    console.log("Incoming WhatsApp Event:");
    console.log(JSON.stringify(req.body, null, 2));

    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log("Zavora WhatsApp server running on port 3000");
});