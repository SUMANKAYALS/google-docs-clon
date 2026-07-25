const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Redis = require("ioredis");

// Helper to manually parse .env.local if not loaded by runner
function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split(/\r?\n/).forEach((line) => {
      // Skip comments or empty lines
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
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Worker Redis State Management
let redis = null;
let redisState = "DISCONNECTED";
let hasLoggedFailure = false;
let hasLoggedSuccess = false;

function initRedis() {
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      connectTimeout: 2000,
      retryStrategy(times) {
        // Reconnect every 5 seconds
        return 5000;
      },
    });

    redis.on("ready", () => {
      redisState = "CONNECTED";
      hasLoggedFailure = false;
      if (!hasLoggedSuccess) {
        console.log("[Persistence Worker Redis] Connected successfully. Cache queue enabled.");
        hasLoggedSuccess = true;
      }
    });

    redis.on("error", () => {
      redisState = "FALLBACK";
      if (!hasLoggedFailure) {
        console.warn("[Persistence Worker Redis] Unavailable. Running in MongoDB-only mode (worker idle).");
        hasLoggedFailure = true;
        hasLoggedSuccess = false;
      }
    });

    redis.on("close", () => {
      redisState = "FALLBACK";
    });

    redis.on("end", () => {
      redisState = "FALLBACK";
    });
  } catch (err) {
    redisState = "FALLBACK";
    if (!hasLoggedFailure) {
      console.warn("[Persistence Worker Redis] Initialization failed. Running in MongoDB-only mode. Details:", err.message);
      hasLoggedFailure = true;
    }
  }
}

initRedis();

// Mongoose Document Model Definition
const { Schema } = mongoose;
const DocumentSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, required: true },
    collaborators: [{ type: Schema.Types.ObjectId }],
    collaboratorMembers: [
      {
        userId: { type: Schema.Types.ObjectId, required: true },
        role: { type: String, enum: ["editor", "viewer"], default: "editor" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    updatedBy: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

const DocumentModel = mongoose.models.Document || mongoose.model("Document", DocumentSchema);

// Connection helper for MongoDB
async function connectToMongo() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  await mongoose.connect(MONGODB_URI);
}

// Queue Processing Loop
async function processPendingFlushes() {
  // Never execute Redis commands if we are not connected
  if (redisState !== "CONNECTED" || !redis) {
    return;
  }

  let docIds = [];
  try {
    const now = Date.now();
    docIds = await redis.zrangebyscore("pending_flushes", "-inf", now, "LIMIT", 0, 10);
  } catch (err) {
    // Avoid throwing/logging repeatedly
    return;
  }

  if (!docIds || docIds.length === 0) {
    return;
  }

  for (const documentId of docIds) {
    let removed = 0;
    try {
      removed = await redis.zrem("pending_flushes", documentId);
    } catch (err) {
      continue;
    }

    if (removed === 0) {
      continue;
    }

    console.log(`[Persistence Worker] Flushing changes for document: ${documentId}`);

    let cachedData = null;
    const cacheKey = `doc:${documentId}`;

    try {
      cachedData = await redis.hgetall(cacheKey);
    } catch (err) {
      console.warn(`[Persistence Worker] Failed to read cache for ${documentId}:`, err.message);
      continue;
    }

    if (!cachedData || !cachedData.content) {
      console.log(`[Persistence Worker] No cached data found for: ${documentId}. Skipping.`);
      continue;
    }

    try {
      // Connect to MongoDB
      await connectToMongo();

      const cachedUpdatedAt = new Date(cachedData.updatedAt);
      const cachedUpdatedBy = cachedData.updatedBy;

      // Update document content in MongoDB only if our cached update is newer
      const updateResult = await DocumentModel.updateOne(
        {
          _id: documentId,
          updatedAt: { $lt: cachedUpdatedAt },
        },
        {
          $set: {
            content: cachedData.content,
            updatedBy: new mongoose.Types.ObjectId(cachedUpdatedBy),
            updatedAt: cachedUpdatedAt,
          },
        },
        { timestamps: false }
      );

      if (updateResult.matchedCount === 0) {
        // Checking if document exists in DB at all
        const docExists = await DocumentModel.exists({ _id: documentId });
        if (!docExists) {
          console.warn(`[Persistence Worker] Document ${documentId} not found in MongoDB. Dropping cache.`);
        } else {
          console.log(`[Persistence Worker] MongoDB has a newer or equal version of ${documentId}. Skipping write.`);
        }
      } else {
        console.log(`[Persistence Worker] Successfully saved document ${documentId} to MongoDB.`);
      }

      // Cleanup or expire the Redis cache key
      try {
        await redis.expire(cacheKey, 3600); // Keep cached read value for 1 hour
      } catch (err) {
        // Ignore cache cleanup failures
      }
    } catch (dbError) {
      console.error(`[Persistence Worker] MongoDB persistence failure for ${documentId}:`, dbError.message);

      // Re-queue the flush task to retry in 5 seconds
      const retryTime = Date.now() + 5000;
      try {
        await redis.zadd("pending_flushes", retryTime, documentId);
        console.log(`[Persistence Worker] Re-queued document ${documentId} for retry in 5s.`);
      } catch (queueErr) {
        console.error("[Persistence Worker] Failed to re-queue document ID:", queueErr.message);
      }
    }
  }
}

// Graceful worker polling loop
async function workerLoop() {
  console.log("[Persistence Worker] Worker started, listening to pending queue...");
  while (true) {
    try {
      if (redisState === "CONNECTED") {
        await processPendingFlushes();
      }
    } catch (loopError) {
      console.error("[Persistence Worker] Error in worker loop iteration:", loopError);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Graceful shutdown handlers
const shutdown = async () => {
  console.log("[Persistence Worker] Shutting down gracefully...");
  try {
    if (redis) redis.disconnect();
    await mongoose.disconnect();
  } catch (err) {
    // Ignore cleanup errors during shutdown
  }
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

workerLoop();
