import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import htmlToDocx from "html-to-docx";

export async function POST(request: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
    try {
        const { documentId } = await params;
        const { title, content } = await request.json();

        if (!content) {
            return NextResponse.json({ error: "Missing content" }, { status: 400 });
        }

        const createDocx = htmlToDocx as unknown as (html: string, options?: unknown, config?: unknown) => Promise<Uint8Array>;
        const docxBytes = await createDocx(content, undefined, {
            orientation: "portrait",
            margins: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
            },
        });

        const safeBytes = Array.from(docxBytes);

        return new Response(new Blob([new Uint8Array(safeBytes)], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename="${(title || documentId).replace(/[^a-z0-9-_]+/gi, "-")}.docx"`,
            },
        });
    } catch (error) {
        console.error("DOCX export failed", error);
        return NextResponse.json({ error: "DOCX export failed" }, { status: 500 });
    }
}
