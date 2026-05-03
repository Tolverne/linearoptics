import { useRef, useState } from "react";
import { toPng } from "html-to-image";

type DataFormat = "json" | "latex" | "text";

interface ExportablePanelProps {
    title: string;
    imageFilename: string;
    dataFilename: string;
    data: unknown;
    dataFormat: DataFormat;
    exportSelector?: string;
    children: React.ReactNode;
}

export function ExportablePanel({
    title,
    imageFilename,
    dataFilename,
    data,
    dataFormat,
    exportSelector = ".export-target",
    children,
}: ExportablePanelProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const raw =
        dataFormat === "json"
            ? JSON.stringify(data, null, 2)
            : String(data ?? "");

    function getExportTarget(): HTMLElement | null {
        if (!ref.current) return null;

        const selected = ref.current.querySelector(exportSelector);

        if (selected instanceof HTMLElement) {
            return selected;
        }

        return ref.current;
    }

    async function downloadImage() {
        const target = getExportTarget();
        if (!target) return;

        const dataUrl = await toPng(target, {
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
        <div
            ref={ref}
            style={{
                position: "relative",
            }}
        >
            <button
                type="button"
                onClick={() => setOpen(true)}
                title={`Export ${title}`}
                style={{
                    position: "absolute",
                    right: 12,
                    top: 12,
                    zIndex: 20,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    borderRadius: 10,
                    padding: "6px 10px",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#334155",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
                }}
            >
                Export
            </button>

            {children}

            {open && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1000,
                        background: "rgba(15, 23, 42, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 24,
                    }}
                >
                    <div
                        style={{
                            width: "min(900px, 100%)",
                            maxHeight: "85vh",
                            overflow: "auto",
                            background: "#ffffff",
                            borderRadius: 16,
                            padding: 20,
                            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.25)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 14,
                            }}
                        >
                            <h2 style={{ margin: 0, fontSize: 18 }}>Export {title}</h2>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    fontSize: 22,
                                    cursor: "pointer",
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                            <button type="button" onClick={downloadImage}>
                                Download PNG
                            </button>

                            <button type="button" onClick={downloadData}>
                                Download Data
                            </button>

                            <button type="button" onClick={copyData}>
                                Copy Data
                            </button>
                        </div>

                        <pre
                            style={{
                                whiteSpace: "pre-wrap",
                                maxHeight: "50vh",
                                overflow: "auto",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 12,
                                padding: 12,
                                fontSize: 12,
                            }}
                        >
                            {raw}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}