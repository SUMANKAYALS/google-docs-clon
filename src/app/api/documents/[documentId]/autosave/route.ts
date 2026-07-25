import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase, isValidObjectId } from "@/lib/db";
import { DocumentModel } from "@/models/Document";
import { redisManager } from "@/lib/redis";

function createErrorResponse(message: string, status: number, details?: Record<string, unknown>) {
    return NextResponse.json(
        {
            success: false,
            error: message,
            ...(details ? { details } : {}),
        },
        { status }
    );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ documentId?: string }> }) {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { documentId } = await params;

    let sessionUserId: string | undefined;

    try {
        const session = await auth();
        sessionUserId = session?.user?.id;

        // Test mode bypass for integration tests in local dev environment
        if (!sessionUserId && process.env.NODE_ENV !== "production") {
            const testUserId = req.headers.get("x-test-user-id");
            if (testUserId && isValidObjectId(testUserId)) {
                sessionUserId = testUserId;
            }
        }

        if (!sessionUserId || !isValidObjectId(sessionUserId)) {
            return createErrorResponse("Unauthorized", 401);
        }

        if (!documentId || !isValidObjectId(documentId)) {
            return createErrorResponse("Invalid document ID", 400);
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return createErrorResponse("Invalid request body", 400);
        }

        if (!body || typeof body !== "object" || typeof (body as { content?: unknown }).content !== "string") {
            return createErrorResponse("Invalid request body", 400);
        }

        const content = (body as { content: string }).content;

        console.log(`[Autosave API] Received request for Document ID: ${documentId}, User: ${sessionUserId}, Content length: ${content.length}`);

        await connectToDatabase();

        const doc = await DocumentModel.findById(documentId);
        if (!doc) {
            return createErrorResponse("Document not found", 404);
        }

        const isOwner = doc.owner.toString() === sessionUserId;
        const member = doc.collaboratorMembers?.find((item) => item.userId.toString() === sessionUserId);
        if (!isOwner && (!member || member.role === "viewer")) {
            return createErrorResponse("Forbidden", 403);
        }

        // Get Redis client ONLY if connection is active/ready
        const redis = redisManager.getClient();

        if (redis) {
            const cacheKey = `doc:${documentId}`;

            // Get current cached data from Redis
            const cachedData = await redis.hgetall(cacheKey);

            // Compare content to skip unnecessary writes
            const currentContent = cachedData.content !== undefined ? cachedData.content : doc.content;
            console.log(`[Autosave API] Redis connected. Cached content length: ${cachedData.content?.length ?? 'none'}, skip write: ${currentContent === content}`);
            if (currentContent === content) {
                const currentUpdatedAt = cachedData.updatedAt || doc.updatedAt.toISOString();
                return NextResponse.json({
                    success: true,
                    skipped: true,
                    updatedAt: currentUpdatedAt,
                });
            }

            // Cache the latest document state in Redis
            const updatedAt = new Date().toISOString();
            await redis.hset(cacheKey, {
                content,
                updatedAt,
                updatedBy: sessionUserId,
            });

            console.log(`[Autosave API] Cached new content to Redis (length: ${content.length}) for Document ID: ${documentId}`);

            // Set absolute TTL of 24 hours on the document cache entry
            await redis.expire(cacheKey, 86400);

            // Schedule/Debounce the write in Redis (e.g., 3-second debounce period)
            const debounceDelay = 3000;
            const flushTime = Date.now() + debounceDelay;
            await redis.zadd("pending_flushes", flushTime, documentId);

            return NextResponse.json({
                success: true,
                skipped: false,
                updatedAt,
            });
        } else {
            // Redis is down/disconnected/fallback. Write directly to MongoDB!
            console.log(`[Autosave API] Redis offline fallback. MongoDB content length: ${doc.content?.length ?? 0}, skip write: ${doc.content === content}`);
            if (doc.content === content) {
                return NextResponse.json({
                    success: true,
                    skipped: true,
                    updatedAt: doc.updatedAt.toISOString(),
                });
            }

            doc.content = content;
            doc.updatedBy = new mongoose.Types.ObjectId(sessionUserId);
            await doc.save();

            console.log(`[Autosave API] Saved directly to MongoDB for Document ID: ${documentId}, UpdatedAt: ${doc.updatedAt.toISOString()}`);

            return NextResponse.json({
                success: true,
                skipped: false,
                updatedAt: doc.updatedAt.toISOString(),
            });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        const stack = error instanceof Error ? error.stack : undefined;

        console.error("[autosave] save pipeline failure", {
            requestId,
            documentId,
            userId: sessionUserId,
            route: "/api/documents/[documentId]/autosave",
            message,
            stack,
        });

        return createErrorResponse("Unexpected save failure", 500);
    }
}
