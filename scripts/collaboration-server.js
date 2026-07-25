const http = require("http");
const WebSocket = require("ws");
const Y = require("yjs");
const syncProtocol = require("y-protocols/dist/sync.cjs");
const awarenessProtocol = require("y-protocols/dist/awareness.cjs");
const encoding = require("lib0/dist/encoding.cjs");
const decoding = require("lib0/dist/decoding.cjs");

const messageSync = 0;
const messageAwareness = 1;
const messageAuth = 2;
const messageQueryAwareness = 3;

const port = process.env.PORT || process.env.COLLAB_PORT || 1234;
const host = process.env.HOST || "0.0.0.0";

const docs = new Map();

const getDoc = (docname) => {
  let doc = docs.get(docname);
  if (!doc) {
    doc = new Y.Doc();
    doc.name = docname;
    doc.conns = new Map();
    doc.awareness = new awarenessProtocol.Awareness(doc);
    doc.awareness.setLocalState(null);

    doc.awareness.on("update", ({ added, updated, removed }, origin) => {
      if (origin !== null && doc.conns.has(origin)) {
        const controlledIds = doc.conns.get(origin);
        added.forEach((id) => controlledIds.add(id));
        removed.forEach((id) => controlledIds.delete(id));
      }
      const changed = added.concat(updated, removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(doc.awareness, changed)
      );
      const buff = encoding.toUint8Array(encoder);
      doc.conns.forEach((_, c) => {
        if (c.readyState === WebSocket.OPEN) {
          c.send(buff);
        }
      });
    });

    doc.on("update", (update) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);
      doc.conns.forEach((_, c) => {
        if (c.readyState === WebSocket.OPEN) {
          c.send(message);
        }
      });
    });

    docs.set(docname, doc);
  }
  return doc;
};

const server = http.createServer((request, response) => {
  if (request.url === "/health" || request.url === "/") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ status: "ok", activeDocs: docs.size }));
    return;
  }
  response.writeHead(404);
  response.end();
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (conn, req) => {
  const docName = req.url?.slice(1).split("?")[0] || "default-doc";
  const doc = getDoc(docName);
  doc.conns.set(conn, new Set());

  conn.isAlive = true;
  conn.on("pong", () => {
    conn.isAlive = true;
  });

  conn.on("message", (message) => {
    try {
      const buf = message instanceof Uint8Array
        ? new Uint8Array(message.buffer, message.byteOffset, message.byteLength)
        : new Uint8Array(message);

      const encoder = encoding.createEncoder();
      const decoder = decoding.createDecoder(buf);
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync:
          encoding.writeVarUint(encoder, messageSync);
          syncProtocol.readSyncMessage(decoder, encoder, doc, conn);
          if (encoding.length(encoder) > 1) {
            conn.send(encoding.toUint8Array(encoder));
          }
          break;
        case messageAwareness:
          awarenessProtocol.applyAwarenessUpdate(
            doc.awareness,
            decoding.readVarUint8Array(decoder),
            conn
          );
          break;
        case messageQueryAwareness: {
          const awarenessEncoder = encoding.createEncoder();
          encoding.writeVarUint(awarenessEncoder, messageAwareness);
          encoding.writeVarUint8Array(
            awarenessEncoder,
            awarenessProtocol.encodeAwarenessUpdate(
              doc.awareness,
              Array.from(doc.awareness.getStates().keys())
            )
          );
          conn.send(encoding.toUint8Array(awarenessEncoder));
          break;
        }
      }
    } catch (err) {
      console.error("[Yjs Server] Message processing error:", err);
    }
  });

  // Send Sync Step 1
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  conn.send(encoding.toUint8Array(encoder));

  // Send Awareness States
  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(
        doc.awareness,
        Array.from(awarenessStates.keys())
      )
    );
    conn.send(encoding.toUint8Array(awarenessEncoder));
  }

  conn.on("close", () => {
    const controlledIds = doc.conns.get(conn);
    doc.conns.delete(conn);
    if (controlledIds) {
      awarenessProtocol.removeAwarenessStates(
        doc.awareness,
        Array.from(controlledIds),
        conn
      );
    }
    if (doc.conns.size === 0) {
      doc.destroy();
      docs.delete(docName);
    }
  });
});

const pingInterval = setInterval(() => {
  wss.clients.forEach((conn) => {
    if (conn.isAlive === false) {
      return conn.terminate();
    }
    conn.isAlive = false;
    conn.ping();
  });
}, 30000);

wss.on("close", () => {
  clearInterval(pingInterval);
});

wss.on("error", (error) => {
  console.error("[Yjs Collaboration Server] WebSocket Error:", error);
});

server.listen(port, host, () => {
  console.log(`[Yjs Collaboration Server] Server running on ws://${host}:${port}`);
});

const shutdown = () => {
  console.log("[Yjs Collaboration Server] Shutting down gracefully...");
  clearInterval(pingInterval);
  wss.clients.forEach((client) => client.close());
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
