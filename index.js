import express from "express";
import { google } from "googleapis";

const app = express();
app.use(express.json());

// ================================
// CONFIG
// ================================

// Your spreadsheet ID
const SHEETS = {
  main: "1VwAJ9XqeI3OpuSoL0Dr25ko7AYgFrHl94t9yM_Y8UIc"
};

// Load service account from ENV
if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
  console.error("Missing GOOGLE_SERVICE_ACCOUNT env variable");
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

// ================================
// ROUTES
// ================================

// Health check (Render uses this)
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Append a row
app.post("/append-row", async (req, res) => {
  try {
    const { sheet, values } = req.body;

    if (!SHEETS[sheet]) {
      return res.status(400).json({ error: "Invalid sheet alias" });
    }

    if (!Array.isArray(values)) {
      return res.status(400).json({ error: "values must be an array" });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEETS[sheet],
      range: "A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values]
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to append row" });
  }
});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
