const { spawn } = require("child_process");
const http = require("http");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Load env variables
function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split(/\r?\n/).forEach((line) => {
      if (line.trim().startsWith("#") || !line.includes("=")) return;
      const index = line.indexOf("=");
      const key = line.slice(0, index).trim();
      let val = line.slice(index + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    });
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/clouds-docs";
const PORT = 3001;

// Define simple Document Schema for verification
const { Schema } = mongoose;
const DocumentSchema = new Schema(
  {
    title: String,
    content: String,
    owner: Schema.Types.ObjectId,
    collaborators: [Schema.Types.ObjectId],
    collaboratorMembers: [
      {
        userId: Schema.Types.ObjectId,
        role: String,
        joinedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

const DocumentModel = mongoose.models.Document || mongoose.model("Document", DocumentSchema);

async function run() {
  console.log("=== STARTING AUTOSAVE FALLBACK INTEGRATION TEST ===");

  // 1. Connect to MongoDB and prepare test data
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  const testUserId = new mongoose.Types.ObjectId();
  const testDoc = await DocumentModel.create({
    title: `Integration Test Doc ${Date.now()}`,
    content: "Original Content",
    owner: testUserId,
    collaborators: [],
    collaboratorMembers: [],
  });

  console.log(`Prepared Test User: ${testUserId.toString()}`);
  console.log(`Prepared Test Document: ${testDoc._id.toString()}`);

  // 2. Start the Next.js dev server in the background
  console.log(`Starting Next.js dev server on port ${PORT}...`);
  const devServer = spawn("npx", ["next", "dev", "-p", PORT.toString()], {
    shell: true,
    stdio: "pipe",
    env: { ...process.env, PORT: PORT.toString() },
  });

  let serverReady = false;

  // Monitor stdout to know when server is ready
  devServer.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(`[Next.js Server] ${output.trim()}`);
    if (output.includes("Ready") || output.includes("Ready in") || output.includes("Local:")) {
      serverReady = true;
    }
  });

  devServer.stderr.on("data", (data) => {
    console.error(`[Next.js Server Error] ${data.toString().trim()}`);
  });

  // Wait for the dev server to boot (up to 15 seconds)
  console.log("Waiting for server to become ready...");
  for (let i = 0; i < 30; i++) {
    if (serverReady) break;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (!serverReady) {
    console.error("Timeout waiting for Next.js dev server to start.");
    devServer.kill("SIGKILL");
    process.exit(1);
  }

  console.log("Server is ready. Triggering autosave request (Redis offline fallback scenario)...");

  // 3. Send autosave request to the running server
  const testContent = JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: `What is a laptop? (Updated at ${new Date().toISOString()})`,
          },
        ],
      },
    ],
  });
  const requestData = JSON.stringify({ content: testContent });

  const options = {
    hostname: "127.0.0.1",
    port: PORT,
    path: `/api/documents/${testDoc._id.toString()}/autosave`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestData),
      "x-test-user-id": testUserId.toString(),
    },
  };

  const req = http.request(options, (res) => {
    let responseBody = "";

    res.on("data", (chunk) => {
      responseBody += chunk;
    });

    res.on("end", async () => {
      console.log(`HTTP Status: ${res.statusCode}`);
      console.log(`HTTP Headers: ${JSON.stringify(res.headers)}`);
      console.log(`HTTP Response: ${responseBody}`);

      try {
        const payload = JSON.parse(responseBody);
        
        // Assertions
        if (res.statusCode !== 200 || !payload.success) {
          throw new Error(`Autosave failed. Status code was ${res.statusCode}, response: ${responseBody}`);
        }
        
        console.log("Autosave response reports success. Querying MongoDB directly to verify fallback write...");
        
        // Wait a brief moment and check MongoDB
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const docInDb = await DocumentModel.findById(testDoc._id);
        
        console.log(`MongoDB Document Content: "${docInDb.content}"`);
        console.log(`Expected Content: "${testContent}"`);

        if (docInDb.content !== testContent) {
          throw new Error("Content mismatch! MongoDB was not updated directly.");
        }

        console.log("✓ SUCCESS: MongoDB was updated directly while Redis was unavailable!");
        console.log("✓ SUCCESS: No HTTP 500 error was returned. No application failures occurred.");
      } catch (err) {
        console.error("❌ TEST FAILED:", err.message);
        cleanup(1);
        return;
      }

      cleanup(0);
    });
  });

  req.on("error", (e) => {
    console.error(`Problem with request: ${e.message}`);
    cleanup(1);
  });

  req.write(requestData);
  req.end();

  function cleanup(exitCode) {
    console.log("Shutting down dev server...");
    devServer.kill();
    mongoose.disconnect().then(() => {
      console.log("Database disconnected. Exiting test.");
      process.exit(exitCode);
    });
  }
}

run().catch((err) => {
  console.error("Unhandled test execution error:", err);
  process.exit(1);
});
