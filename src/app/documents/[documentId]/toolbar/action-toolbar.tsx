"use client";

import React, { useCallback } from "react";
import { FileDownIcon, FileTextIcon, PrinterIcon } from "lucide-react";
import { useEditorStore } from "@/store/use-editor-store";

interface ActionToolbarProps {
    documentId: string;
    documentTitle: string;
}

async function exportDocumentAsPdf(documentTitle: string, html: string) {
    const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
    ]);

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    wrapper.style.width = "794px";
    wrapper.style.padding = "24px";
    wrapper.style.background = "white";
    wrapper.style.color = "black";
    wrapper.style.fontFamily = "Arial, sans-serif";
    wrapper.style.lineHeight = "1.5";

    document.body.appendChild(wrapper);
    const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
    });
    document.body.removeChild(wrapper);

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 72;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 36;
    let remainingHeight = imgHeight;

    while (remainingHeight > 0) {
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 36, position, imgWidth, imgHeight, undefined, "FAST");
        remainingHeight -= pageHeight - 72;
        if (remainingHeight > 0) {
            pdf.addPage();
            position = 36;
        }
    }

    pdf.save(`${documentTitle}.pdf`);
}

async function exportDocumentAsDocx(documentId: string, documentTitle: string, html: string) {
    const response = await fetch(`/api/documents/${documentId}/export`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: documentTitle, content: html }),
    });

    if (!response.ok) {
        throw new Error("Unable to export document as Word file.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${documentTitle}.docx`;
    link.click();
    URL.revokeObjectURL(url);
}

export const ActionToolbar = React.memo(({ documentId, documentTitle }: ActionToolbarProps) => {
    const editor = useEditorStore((state) => state.editor);

    const handlePrint = useCallback(() => {
        if (!editor) return;

        const content = editor.getHTML();
        const printableHtml = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${documentTitle}</title>
          <style>
            @page { size: A4; margin: 16mm; }
            body { font-family: Arial, sans-serif; line-height: 1.5; color: #111; margin: 0; padding: 24px; background: white; }
            img { max-width: 100%; height: auto; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #d0d7de; padding: 8px; }
            h1, h2, h3, h4 { page-break-after: avoid; }
            p, ul, ol, table { break-inside: avoid; }
          </style>
        </head>
        <body>
          <main>${content}</main>
        </body>
      </html>`;

        const printWindow = window.open("", "_blank", "width=900,height=700,noopener,noreferrer");

        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(printableHtml);
            printWindow.document.close();

            const triggerPrint = () => {
                try {
                    printWindow.focus();
                    printWindow.print();
                } catch {
                    // Ignore print dialog errors and fall back gracefully.
                }
            };

            if (printWindow.document.readyState === "complete") {
                triggerPrint();
            } else {
                printWindow.addEventListener("load", triggerPrint, { once: true });
            }
            return;
        }

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "-9999px";
        iframe.style.bottom = "-9999px";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.srcdoc = printableHtml;
        document.body.appendChild(iframe);

        iframe.onload = () => {
            const iframeWindow = iframe.contentWindow;
            if (iframeWindow) {
                iframeWindow.focus();
                iframeWindow.print();
            }
            window.setTimeout(() => {
                iframe.remove();
            }, 1000);
        };
    }, [documentTitle, editor]);

    const handleExportPdf = useCallback(async () => {
        if (!editor) return;
        await exportDocumentAsPdf(documentTitle, editor.getHTML());
    }, [documentTitle, editor]);

    const handleExportDocx = useCallback(async () => {
        if (!editor) return;
        await exportDocumentAsDocx(documentId, documentTitle, editor.getHTML());
    }, [documentId, documentTitle, editor]);

    return (
        <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50/90 px-1.5 py-1 shadow-sm">
            <button type="button" onClick={handlePrint} className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm text-gray-700 transition-colors hover:bg-neutral-200/80" title="Print">
                <PrinterIcon className="size-4" />
                <span className="hidden sm:inline">Print</span>
            </button>
            <button type="button" onClick={handleExportPdf} className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm text-gray-700 transition-colors hover:bg-neutral-200/80" title="Export PDF">
                <FileDownIcon className="size-4" />
                <span className="hidden sm:inline">PDF</span>
            </button>
            <button type="button" onClick={handleExportDocx} className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm text-gray-700 transition-colors hover:bg-neutral-200/80" title="Export Word">
                <FileTextIcon className="size-4" />
                <span className="hidden sm:inline">DOCX</span>
            </button>
        </div>
    );
});

ActionToolbar.displayName = "ActionToolbar";
