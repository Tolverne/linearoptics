import React from "react";
import type { SwapComponent } from "@/types/simulation";

type SwapNodeProps = {
    component: SwapComponent;
    rowHeight?: number;
    columnWidth?: number;
    isSelected?: boolean;
    onSelect?: () => void;
    onDragStart?: (event: React.DragEvent<HTMLButtonElement>) => void;
};

const SwapNode: React.FC<SwapNodeProps> = ({
    component,
    rowHeight = 72,
    columnWidth = 96,
    isSelected = false,
    onSelect,
    onDragStart,
}) => {
    const topRail = Math.min(component.rails[0], component.rails[1]);
    const bottomRail = Math.max(component.rails[0], component.rails[1]);

    const width = columnWidth * 0.9;
    const height = (bottomRail - topRail + 1) * rowHeight;
    const xPad = columnWidth * 0.05;

    const strokeMain = isSelected ? "#fde68a" : "#fbbf24";
    const strokeGlow = isSelected
        ? "rgba(251, 191, 36, 0.42)"
        : "rgba(251, 191, 36, 0.22)";

    const internalHighlight = isSelected
        ? "rgba(255, 251, 235, 0.72)"
        : "rgba(254, 243, 199, 0.48)";

    const benchCutout = "rgba(7, 11, 20, 0.88)";
    const railYTop = 25;
    const railYBottom = 75;

    return (
        <button
            type="button"
            onClick={onSelect}
            onMouseDown={onSelect}
            draggable
            onDragStart={onDragStart}
            title={`Swap (${component.rails[0] + 1} ↔ ${component.rails[1] + 1})`}
            style={{
                position: "absolute",
                left: component.column * columnWidth + xPad,
                top: topRail * rowHeight,
                width,
                height,
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                filter: isSelected
                    ? "drop-shadow(0 0 16px rgba(251, 191, 36, 0.46))"
                    : "drop-shadow(0 0 8px rgba(251, 191, 36, 0.18))",
            }}
        >
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ display: "block", overflow: "visible" }}
            >
                {isSelected && (
                    <rect
                        x="2"
                        y="2"
                        width="96"
                        height="96"
                        rx="13"
                        fill="rgba(251, 191, 36, 0.08)"
                        stroke="rgba(251, 191, 36, 0.5)"
                        strokeWidth="1.6"
                    />
                )}

                <rect
                    x="8"
                    y="10"
                    width="84"
                    height="80"
                    rx="14"
                    fill="rgba(7, 11, 20, 0.28)"
                    stroke="rgba(148, 163, 184, 0.12)"
                    strokeWidth="1"
                />

                <line
                    x1="16"
                    y1={railYTop}
                    x2="84"
                    y2={railYTop}
                    stroke={benchCutout}
                    strokeWidth="11"
                    strokeLinecap="round"
                />

                <line
                    x1="16"
                    y1={railYBottom}
                    x2="84"
                    y2={railYBottom}
                    stroke={benchCutout}
                    strokeWidth="11"
                    strokeLinecap="round"
                />

                <path
                    d="M 5 75 C 28 75, 34 75, 46 56"
                    fill="none"
                    stroke={strokeGlow}
                    strokeWidth="11"
                    strokeLinecap="round"
                />

                <path
                    d="M 54 44 C 66 25, 72 25, 95 25"
                    fill="none"
                    stroke={strokeGlow}
                    strokeWidth="11"
                    strokeLinecap="round"
                />

                <path
                    d="M 5 25 C 28 25, 34 25, 50 50 C 66 75, 72 75, 95 75"
                    fill="none"
                    stroke={strokeGlow}
                    strokeWidth="11"
                    strokeLinecap="round"
                />

                <path
                    d="M 5 75 C 28 75, 34 75, 46 56"
                    fill="none"
                    stroke={strokeMain}
                    strokeWidth="3.6"
                    strokeLinecap="round"
                />

                <path
                    d="M 54 44 C 66 25, 72 25, 95 25"
                    fill="none"
                    stroke={strokeMain}
                    strokeWidth="3.6"
                    strokeLinecap="round"
                />

                <circle
                    cx="50"
                    cy="50"
                    r="8"
                    fill={benchCutout}
                    stroke="rgba(251, 191, 36, 0.26)"
                    strokeWidth="1"
                />

                <path
                    d="M 5 25 C 28 25, 34 25, 50 50 C 66 75, 72 75, 95 75"
                    fill="none"
                    stroke={strokeMain}
                    strokeWidth="3.6"
                    strokeLinecap="round"
                />

                <circle
                    cx="50"
                    cy="50"
                    r="3"
                    fill={isSelected ? "#fffbeb" : "#fde68a"}
                    stroke="rgba(251, 191, 36, 0.5)"
                    strokeWidth="1"
                />

                <path
                    d="M 43 44 L 50 50 L 43 56"
                    fill="none"
                    stroke={internalHighlight}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <path
                    d="M 57 56 L 50 50 L 57 44"
                    fill="none"
                    stroke={internalHighlight}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <rect
                    x="12"
                    y="12"
                    width="25"
                    height="16"
                    rx="6"
                    fill="rgba(7, 11, 20, 0.72)"
                    stroke="rgba(251, 191, 36, 0.24)"
                    strokeWidth="1"
                />

                <text
                    x="24.5"
                    y="20.5"
                    fontSize="8"
                    fontWeight="900"
                    fill={isSelected ? "#fffbeb" : "#fde68a"}
                    textAnchor="middle"
                    dominantBaseline="middle"
                >
                    SWAP
                </text>
            </svg>
        </button>
    );
};

export default SwapNode;