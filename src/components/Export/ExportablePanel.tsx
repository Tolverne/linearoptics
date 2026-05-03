// src/components/export/ExportablePanel.tsx

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

type DataFormat = "json" | "latex" | "text";

interface ExportablePanelProps {
    title: string;
    imageFilename: string;
    dataFilename: string;
    data: unknown;
    dataFormat: DataFormat;
    children: React.ReactNode;
}

export function ExportablePanel({
    title,
    imageFilename,
    dataFilename,
    data,
    dataFormat,
    children,
}: ExportablePanelProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const raw =
        dataFormat === "json"
            ? JSON.stringify(data, null, 2)
            : String(data ?? "");

    async function downloadImage() {
        if (!ref.current) return;

        const dataUrl = await toPng(ref.current, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: "#ffffff",
        });

        const link = document.createElement("a");
        link.download = imageFilename;
        link.href = dataUrl;
        link.click();
    }

    function downloadData() {
        const mime =
            dataFormat === "json"
                ? "application/json"
                : dataFormat === "latex"
                    ? "application/x-tex"
                    : "text/plain";

        const blob = new Blob([raw], { type: mime });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.download = dataFilename;
        link.href = url;
        link.click();

        URL.revokeObjectURL(url);
    }

    async function copyData() {
        await navigator.clipboard.writeText(raw);
    }

    return (
        <div className="relative rounded-xl border bg-white p-4 shadow-sm">
            <button
                className="absolute right-3 top-3 rounded-md border bg-white px-2 py-1 text-sm shadow-sm hover:bg-gray-50"
                onClick={() => setOpen(true)}
                title={`Export ${title}`}
            >
                Export
            </button>

            <div ref={ref} className="bg-white p-2">
                {children}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-xl">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Export {title}</h2>
                            <button onClick={() => setOpen(false)}>✕</button>
                        </div>

                        <div className="mb-4 flex gap-2">
                            <button onClick={downloadImage} className="rounded-md border px-3 py-2">
                                Download PNG
                            </button>
                            <button onClick={downloadData} className="rounded-md border px-3 py-2">
                                Download Data
                            </button>
                            <button onClick={copyData} className="rounded-md border px-3 py-2">
                                Copy Data
                            </button>
                        </div>

                        <pre className="max-h-[50vh] overflow-auto rounded-md bg-gray-100 p-3 text-sm">
                            {raw}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}