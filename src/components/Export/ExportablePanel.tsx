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

const brand = {
    navy: "#020617",
    slate900: "#0f172a",
    slate800: "#1e293b",
    slate700: "#334155",
    slate500: "#64748b",
    slate400: "#94a3b8",
    slate300: "#cbd5e1",
    slate200: "#e2e8f0",
    slate100: "#f1f5f9",
    white: "#ffffff",
    teal: "#14b8a6",
    tealLight: "#2dd4bf",
    sapphire: "#2563eb",
    sapphireLight: "#60a5fa",
};

const floatingExportButtonStyle: React.CSSProperties = {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 20,
    border: "1px solid rgba(45, 212, 191, 0.42)",
    background:
        "linear-gradient(135deg, rgba(20, 184, 166, 0.95), rgba(37, 99, 235, 0.95))",
    borderRadius: 999,
    padding: "7px 13px",
    fontSize: 12,
    fontWeight: 850,
    color: "#ffffff",
    cursor: "pointer",
    boxShadow:
        "0 10px 26px rgba(37, 99, 235, 0.22), 0 4px 10px rgba(2, 6, 23, 0.22)",
    letterSpacing: "0.01em",
};

const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background:
        "radial-gradient(circle at top, rgba(20, 184, 166, 0.18), transparent 32%), rgba(2, 6, 23, 0.72)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
};

const modalStyle: React.CSSProperties = {
    width: "min(920px, 100%)",
    maxHeight: "85vh",
    overflow: "hidden",
    background:
        "linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.98))",
    border: "1px solid rgba(148, 163, 184, 0.24)",
    borderRadius: 22,
    boxShadow:
        "0 28px 80px rgba(2, 6, 23, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    color: brand.slate200,
};

const modalHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    padding: "20px 22px 14px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
};

const modalBodyStyle: React.CSSProperties = {
    padding: 22,
    overflow: "auto",
    maxHeight: "calc(85vh - 90px)",
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 20,
    lineHeight: 1.15,
    fontWeight: 900,
    color: brand.white,
    letterSpacing: "-0.03em",
};

const subtitleStyle: React.CSSProperties = {
    margin: "6px 0 0",
    fontSize: 13,
    color: brand.slate400,
    lineHeight: 1.45,
};

const closeButtonStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    background: "rgba(15, 23, 42, 0.75)",
    color: brand.slate200,
    fontSize: 24,
    lineHeight: "30px",
    cursor: "pointer",
};

const actionRowStyle: React.CSSProperties = {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 16,
};

const primaryButtonStyle: React.CSSProperties = {
    border: "1px solid rgba(45, 212, 191, 0.45)",
    background:
        "linear-gradient(135deg, rgba(20, 184, 166, 0.95), rgba(37, 99, 235, 0.95))",
    color: brand.white,
    borderRadius: 12,
    padding: "9px 13px",
    fontSize: 13,
    fontWeight: 850,
    cursor: "pointer",
    boxShadow: "0 10px 26px rgba(37, 99, 235, 0.20)",
};

const secondaryButtonStyle: React.CSSProperties = {
    border: "1px solid rgba(148, 163, 184, 0.26)",
    background: "rgba(30, 41, 59, 0.82)",
    color: brand.slate200,
    borderRadius: 12,
    padding: "9px 13px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
};

const preStyle: React.CSSProperties = {
    whiteSpace: "pre-wrap",
    maxHeight: "52vh",
    overflow: "auto",
    background:
        "linear-gradient(180deg, rgba(2, 6, 23, 0.92), rgba(15, 23, 42, 0.9))",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
    margin: 0,
    fontSize: 12,
    lineHeight: 1.6,
    color: "#dbeafe",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
};

const formatBadgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid rgba(45, 212, 191, 0.28)",
    background: "rgba(20, 184, 166, 0.10)",
    color: brand.tealLight,
    borderRadius: 999,
    padding: "4px 9px",
    fontSize: 11,
    fontWeight: 850,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
};

function getMimeType(dataFormat: DataFormat) {
    if (dataFormat === "json") return "application/json";
    if (dataFormat === "latex") return "application/x-tex";
    return "text/plain";
}

function getFormatLabel(dataFormat: DataFormat) {
    if (dataFormat === "json") return "JSON";
    if (dataFormat === "latex") return "LaTeX";
    return "Text";
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
    const [copied, setCopied] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

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

        setImageError(null);

        try {
            const dataUrl = await toPng(target, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: brand.slate900,
                style: {
                    color: brand.slate200,
                },
            });

            const link = document.createElement("a");
            link.download = imageFilename;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Failed to export PNG", error);
            setImageError(
                "PNG export failed. Try exporting the raw data instead, or check whether the panel contains unsupported external images."
            );
        }
    }

    function downloadData() {
        const blob = new Blob([raw], { type: getMimeType(dataFormat) });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.download = dataFilename;
        link.href = url;
        link.click();

        URL.revokeObjectURL(url);
    }

    async function copyData() {
        await navigator.clipboard.writeText(raw);
        setCopied(true);

        window.setTimeout(() => {
            setCopied(false);
        }, 1400);
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
                style={floatingExportButtonStyle}
            >
                Export
            </button>

            {children}

            {open && (
                <div
                    style={overlayStyle}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Export ${title}`}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setOpen(false);
                        }
                    }}
                >
                    <div style={modalStyle}>
                        <div style={modalHeaderStyle}>
                            <div>
                                <div style={{ marginBottom: 8 }}>
                                    <span style={formatBadgeStyle}>
                                        {getFormatLabel(dataFormat)} export
                                    </span>
                                </div>

                                <h2 style={titleStyle}>Export {title}</h2>

                                <p style={subtitleStyle}>
                                    Download this panel as a PNG, or copy/download the
                                    underlying {getFormatLabel(dataFormat)} data.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                style={closeButtonStyle}
                                aria-label="Close export dialog"
                                title="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div style={modalBodyStyle}>
                            <div style={actionRowStyle}>
                                <button
                                    type="button"
                                    onClick={downloadImage}
                                    style={primaryButtonStyle}
                                >
                                    Download PNG
                                </button>

                                <button
                                    type="button"
                                    onClick={downloadData}
                                    style={secondaryButtonStyle}
                                >
                                    Download Data
                                </button>

                                <button
                                    type="button"
                                    onClick={copyData}
                                    style={secondaryButtonStyle}
                                >
                                    {copied ? "Copied" : "Copy Data"}
                                </button>
                            </div>

                            {imageError && (
                                <div
                                    style={{
                                        border: "1px solid rgba(248, 113, 113, 0.35)",
                                        background: "rgba(127, 29, 29, 0.28)",
                                        color: "#fecaca",
                                        borderRadius: 14,
                                        padding: "10px 12px",
                                        marginBottom: 14,
                                        fontSize: 13,
                                        lineHeight: 1.45,
                                    }}
                                >
                                    {imageError}
                                </div>
                            )}

                            <pre style={preStyle}>{raw}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}