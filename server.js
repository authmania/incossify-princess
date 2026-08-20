import express from "express";
import path    from "path";
import fs      from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR  = __dirname;
const app = express();

app.use(express.static(SITE_DIR));

// Clean URLs: /dashboard -> /dashboard.html, / -> /index.html
app.get(/^\/([a-z0-9-]+)\/?$/, (req, res) => {
    const page = req.params[0];
    const file = path.join(SITE_DIR, `${page}.html`);
    if (fs.existsSync(file)) return res.sendFile(file);
    res.sendFile(path.join(SITE_DIR, "index.html"));
});

// Fallback to landing page
app.use((req, res) => {
    res.sendFile(path.join(SITE_DIR, "index.html"));
});

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
    console.log(`\nIncossify dev server running at http://localhost:${PORT}\n`);
});
