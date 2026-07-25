const fs = require("fs");
const path = require("path");

const loginDir = path.join(__dirname, "..", "src", "app", "login");
const registerDir = path.join(__dirname, "..", "src", "app", "register");

if (fs.existsSync(loginDir)) {
  fs.rmSync(loginDir, { recursive: true, force: true });
  console.log("Removed src/app/login");
}

if (fs.existsSync(registerDir)) {
  fs.rmSync(registerDir, { recursive: true, force: true });
  console.log("Removed src/app/register");
}
