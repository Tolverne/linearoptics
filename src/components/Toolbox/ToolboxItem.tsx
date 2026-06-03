import React from "react";
import type { ToolboxItemType } from "@/types/simulation";

type ToolboxItemProps = {
    toolType: ToolboxItemType;
    label: string;
    description: string;
};

const componentAccent: Record<ToolboxItemType, string> = {
    beam_splitter: "var(--qopt-cyan)",
    phase_shifter: "var(--qopt-violet)",
    swap: "var(--qopt-amber)",
};

const componentBackground: Record<ToolboxItemType, string> = {
    beam_splitter: "rgba(34, 211, 238, 0.1)",
    phase_shifter: "rgba(167, 139, 250, 0.1)",
    swap: "rgba(251, 191, 36, 0.1)",
};

const componentBorder: Record<ToolboxItemType, string> = {
    beam_splitter: "rgba(34, 211, 238, 0.38)",
    phase_shifter: "rgba(167, 139, 250, 0.38)",
    swap: "rgba(251, 191, 36, 0.38)",
};

function getToolLabel(toolType: ToolboxItemType): string {
    if (toolType === "beam_splitter") return "BS";
    if (toolType === "phase_shifter") return "φ";
    return "↔";
}

function getToolVisual(toolType: ToolboxItemType): React.ReactNode {
    const accent = componentAccent[toolType];

    return (
        <div
            style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                border: `1px solid ${componentBorder[toolType]}`,
                background: componentBackground[toolType],
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                fontSize: toolType === "phase_shifter" ? 20 : 13,
                color: accent,
                boxShadow: `0 0 22px ${componentBackground[toolType]}`,
                flexShrink: 0,
            }}
        >
            {getToolLabel(toolType)}
        </div>
    );
}

const ToolboxItem: React.FC<ToolboxItemProps> = ({
    toolType,
    label,
    description,
}) => {
    const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
        const payload = JSON.stringify({ toolType });

        event.dataTransfer.setData("application/json", payload);
        event.dataTransfer.setData("text/plain", toolType);
        event.dataTransfer.effectAllowed = "copy";
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            title={description}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 16,
                border: "1px solid var(--qopt-border)",
                background:
                    "linear-gradient(180deg, rgba(23, 32, 51, 0.92), rgba(12, 18, 31, 0.92))",
                cursor: "grab",
                userSelect: "none",
                boxShadow: "0 10px 26px rgba(0, 0, 0, 0.18)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 16,
                    background: `linear-gradient(90deg, ${componentBackground[toolType]}, transparent 44%)`,
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                }}
            >
                {getToolVisual(toolType)}

                <div style={{ minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "var(--qopt-text)",
                            marginBottom: 4,
                        }}
                    >
                        {label}
                    </div>

                    <div
                        style={{
                            fontSize: 12,
                            color: "var(--qopt-muted)",
                            lineHeight: 1.35,
                        }}
                    >
                        {description}
                    </div>
                </div>

                <div
                    aria-hidden="true"
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: componentAccent[toolType],
                        boxShadow: `0 0 16px ${componentAccent[toolType]}`,
                        marginLeft: "auto",
                        flexShrink: 0,
                    }}
                />
            </div>
        </div>
    );
};

export default ToolboxItem;