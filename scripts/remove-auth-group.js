const fs = require("fs");
const path = require("path");

const authDir = path.join(__dirname, "..", "src", "app", "(auth)");
if (fs.existsSync(authDir)) {
  fs.rmSync(authDir, { recursive: true, force: true });
  console.log("Successfully removed src/app/(auth) group folder");
}
