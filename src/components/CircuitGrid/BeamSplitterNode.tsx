import React from "react";
import type { BeamSplitterComponent } from "@/types/simulation";
import { formatNiceNumber } from "@/utils/formatNumber";
import { useExperimentStore } from "@/store/useExperimentStore";

type BeamSplitterNodeProps = {
    component: BeamSplitterComponent;
    rowHeight?: number;
    columnWidth?: number;
    isSelected?: boolean;
    onSelect?: () => void;
    onDragStart?: (event: React.DragEvent<HTMLButtonElement>) => void;
};

const BeamSplitterNode: React.FC<BeamSplitterNodeProps> = ({
    component,
    rowHeight = 72,
    columnWidth = 96,
    isSelected = false,
    onSelect,
    onDragStart,
}) => {
    const topRail = Math.min(component.rails[0], component.rails[1]);

    const width = columnWidth * 0.9;
    const height = rowHeight * 2;
    const xPad = columnWidth * 0.05;

    const mode = useExperimentStore((s) => s.numericDisplayMode);

    const thetaLabel = formatNiceNumber(component.params.theta, {
        mode,
    });

    const titleThetaLabel = formatNiceNumber(component.params.theta, {
        mode,
        decimalPlaces: 3,
    });

    const railYTop = 25;
    const railYBottom = 75;

    const railStroke = isSelected ? "#67e8f9" : "#22d3ee";
    const railGlow = isSelected
        ? "rgba(34, 211, 238, 0.42)"
        : "rgba(34, 211, 238, 0.22)";

    const internalStroke = isSelected ? "#e0faff" : "#a5f3fc";
    const mirrorStroke = isSelected ? "#67e8f9" : "#22d3ee";
    const mirrorFill = isSelected
        ? "rgba(34, 211, 238, 0.28)"
        : "rgba(34, 211, 238, 0.16)";

    const benchCutout = "rgba(7, 11, 20, 0.88)";

    return (
        <button
            type="button"
            onClick={onSelect}
            onMouseDown={onSelect}
            draggable
            onDragStart={onDragStart}
            title={`Beam splitter (θ = ${titleThetaLabel})`}
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
                    ? "drop-shadow(0 0 16px rgba(34, 211, 238, 0.45))"
                    : "drop-shadow(0 0 8px rgba(34, 211, 238, 0.18))",
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
                        fill="rgba(34, 211, 238, 0.08)"
                        stroke="rgba(34, 211, 238, 0.5)"
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
                    d="M 5 25 L 40 25"
                    fill="none"
                    stroke={railGlow}
                    strokeWidth="11"
                    strokeLinecap="round"
                />
                <path
                    d="M 5 75 L 40 75"
                    fill="none"
                    stroke={railGlow}
                    strokeWidth="11"
                    strokeLinecap="round"
                />
                <path
                    d="M 60 25 L 95 25"
                    fill="none"
                    stroke={railGlow}
                    strokeWidth="11"
                    strokeLinecap="round"
                />
                <path
                    d="M 60 75 L 95 75"
                    fill="none"
                    stroke={railGlow}
                    strokeWidth="11"
                    strokeLinecap="round"
                />

                <path
                    d="M 5 25 L 40 25"
                    fill="none"
                    stroke={railStroke}
                    strokeWidth="3.4"
                    strokeLinecap="round"
                />
                <path
                    d="M 5 75 L 40 75"
                    fill="none"
                    stroke={railStroke}
                    strokeWidth="3.4"
                    strokeLinecap="round"
                />
                <path
                    d="M 60 25 L 95 25"
                    fill="none"
                    stroke={railStroke}
                    strokeWidth="3.4"
                    strokeLinecap="round"
                />
                <path
                    d="M 60 75 L 95 75"
                    fill="none"
                    stroke={railStroke}
                    strokeWidth="3.4"
                    strokeLinecap="round"
                />

                <path
                    d="M 40 25 L 48 46"
                    fill="none"
                    stroke={internalStroke}
                    strokeWidth="2.7"
                    strokeLinecap="round"
                />
                <path
                    d="M 40 75 L 48 54"
                    fill="none"
                    stroke={internalStroke}
                    strokeWidth="2.7"
                    strokeLinecap="round"
                />
                <path
                    d="M 52 46 L 60 25"
                    fill="none"
                    stroke={internalStroke}
                    strokeWidth="2.7"
                    strokeLinecap="round"
                />
                <path
                    d="M 52 54 L 60 75"
                    fill="none"
                    stroke={internalStroke}
                    strokeWidth="2.7"
                    strokeLinecap="round"
                />

                <rect
                    x="37"
                    y="45"
                    width="26"
                    height="10"
                    rx="3"
                    fill={mirrorFill}
                    stroke={mirrorStroke}
                    strokeWidth="1.8"
                />

                <line
                    x1="40"
                    y1="54"
                    x2="60"
                    y2="46"
                    stroke="rgba(224, 250, 255, 0.48)"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                />

                <circle
                    cx="50"
                    cy="50"
                    r="2.2"
                    fill={isSelected ? "#e0faff" : "#67e8f9"}
                />

                <rect
                    x="62"
                    y="40"
                    width="31"
                    height="20"
                    rx="7"
                    fill="rgba(7, 11, 20, 0.76)"
                    stroke="rgba(34, 211, 238, 0.26)"
                    strokeWidth="1"
                />

                <text
                    x="77.5"
                    y="51"
                    fontSize="8.5"
                    fontWeight="800"
                    fill={isSelected ? "#e0faff" : "#a5f3fc"}
                    textAnchor="middle"
                    dominantBaseline="middle"
                >
                    {thetaLabel}
                </text>

                <text
                    x="15"
                    y="16"
                    fontSize="8"
                    fontWeight="900"
                    fill="rgba(229, 238, 248, 0.72)"
                    textAnchor="start"
                    dominantBaseline="middle"
                >
                    BS
                </text>
            </svg>
        </button>
    );
};

export default BeamSplitterNode;