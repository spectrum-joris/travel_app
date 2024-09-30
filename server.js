import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// gebruik public folder voor statische bestanden
app.use(express.static(path.join(__dirname, "public")));

// endpoint om JSON data op te halen
app.get("/locations", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "locations.json"));
});

// start de server
app.listen(3000, () => {
    console.log(`server draait op http://localhost:${port}`);
});

