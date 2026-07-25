const fs = require("fs");
const path = require("path");

const pagesDir = path.join(__dirname, "..", "pages");
if (fs.existsSync(pagesDir)) {
  fs.rmSync(pagesDir, { recursive: true, force: true });
  console.log("Removed pages directory");
}
