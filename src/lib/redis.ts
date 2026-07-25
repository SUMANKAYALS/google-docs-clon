import Redis from "ioredis";

export type RedisState = "CONNECTED" | "DISCONNECTED" | "FALLBACK";

class RedisManager {
  private client: Redis | null = null;
  private state: RedisState = "DISCONNECTED";
  private hasLoggedFailure = false;
  private hasLoggedSuccess = false;

  constructor() {
    this.init();
  }

  private init() {
    const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: null, // Allow background queuing, but we do not execute commands if status is not ready
        connectTimeout: 2000,
        retryStrategy() {
          // Reconnect every 5 seconds
          return 5000;
        },
      });

      this.client.on("ready", () => {
        this.state = "CONNECTED";
        this.hasLoggedFailure = false;
        if (!this.hasLoggedSuccess) {
          console.log("[Redis] Connected successfully. Cache enabled.");
          this.hasLoggedSuccess = true;
        }
      });

      this.client.on("error", () => {
        this.state = "FALLBACK";
        if (!this.hasLoggedFailure) {
          console.warn("[Redis] Unavailable. Running in MongoDB-only mode.");
          this.hasLoggedFailure = true;
          this.hasLoggedSuccess = false;
        }
      });

      this.client.on("close", () => {
        this.state = "FALLBACK";
      });

      this.client.on("end", () => {
        this.state = "FALLBACK";
      });
    } catch (err: unknown) {
      this.state = "FALLBACK";
      if (!this.hasLoggedFailure) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[Redis] Direct instantiation failed. Running in MongoDB-only mode. Details:", msg);
        this.hasLoggedFailure = true;
      }
    }
  }

  public getStatus(): RedisState {
    return this.state;
  }

  public getClient(): Redis | null {
    if (this.state === "CONNECTED") {
      return this.client;
    }
    return null;
  }
}

// Global cached connection manager instance
declare global {
  // eslint-disable-next-line no-var
  var redisManagerInstance: RedisManager | undefined;
}

const redisManager = global.redisManagerInstance || new RedisManager();

if (!global.redisManagerInstance) {
  global.redisManagerInstance = redisManager;
}

export { redisManager };
