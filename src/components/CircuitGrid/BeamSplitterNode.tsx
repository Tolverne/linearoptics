import React from "react";
import type { BeamSplitterComponent } from "@/types/simulation";

type BeamSplitterNodeProps = {
  component: BeamSplitterComponent;
  rowHeight?: number;
  columnWidth?: number;
  isSelected?: boolean;
  onSelect?: () => void;
};

const BeamSplitterNode: React.FC<BeamSplitterNodeProps> = ({
  component,
  rowHeight = 72,
  columnWidth = 96,
  isSelected = false,
  onSelect,
}) => {
  const topRail = Math.min(component.rails[0], component.rails[1]);

  const width = columnWidth * 0.9;
  const height = rowHeight * 2;
  const xPad = columnWidth * 0.05;

  const fibreStroke = isSelected ? "#2563eb" : "#0f172a";
  const fibreGlow = isSelected
    ? "rgba(37,99,235,0.18)"
    : "rgba(15,23,42,0.08)";
  const mirrorStroke = isSelected ? "#2563eb" : "#475569";
  const mirrorFill = isSelected ? "#dbeafe" : "#e2e8f0";
  const eraseColor = "#f8fafc";

  const thetaLabel = component.params.theta.toFixed(2);

  const railYTop = 25;
  const railYBottom = 75;

  return (
    <button
      type="button"
      onClick={onSelect}
      title={`Beam Splitter (θ = ${component.params.theta.toFixed(3)})`}
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
            rx="10"
            fill="rgba(37,99,235,0.06)"
            stroke="rgba(37,99,235,0.22)"
            strokeWidth="1.5"
          />
        )}

        <line
          x1="18"
          y1={railYTop}
          x2="82"
          y2={railYTop}
          stroke={eraseColor}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <line
          x1="18"
          y1={railYBottom}
          x2="82"
          y2={railYBottom}
          stroke={eraseColor}
          strokeWidth="10"
          strokeLinecap="round"
        />

        <path
          d="M 5 25 L 40 25"
          fill="none"
          stroke={fibreGlow}
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 5 75 L 40 75"
          fill="none"
          stroke={fibreGlow}
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 60 25 L 95 25"
          fill="none"
          stroke={fibreGlow}
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 60 75 L 95 75"
          fill="none"
          stroke={fibreGlow}
          strokeWidth="9"
          strokeLinecap="round"
        />

        <path
          d="M 5 25 L 40 25"
          fill="none"
          stroke={fibreStroke}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 5 75 L 40 75"
          fill="none"
          stroke={fibreStroke}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 60 25 L 95 25"
          fill="none"
          stroke={fibreStroke}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 60 75 L 95 75"
          fill="none"
          stroke={fibreStroke}
          strokeWidth="4"
          strokeLinecap="round"
        />

        <rect
          x="38"
          y="46"
          width="24"
          height="8"
          rx="2"
          fill={mirrorFill}
          stroke={mirrorStroke}
          strokeWidth="2"
        />

        <path
          d="M 40 25 L 48 46"
          fill="none"
          stroke={fibreStroke}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 40 75 L 48 54"
          fill="none"
          stroke={fibreStroke}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 52 46 L 60 25"
          fill="none"
          stroke={fibreStroke}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 52 54 L 60 75"
          fill="none"
          stroke={fibreStroke}
          strokeWidth="3"
          strokeLinecap="round"
        />

        <text
          x="66"
          y="53"
          fontSize="9.5"
          fontWeight="700"
          fill={isSelected ? "#1d4ed8" : "#334155"}
          textAnchor="start"
          dominantBaseline="middle"
        >
          {thetaLabel}
        </text>
      </svg>
    </button>
  );
};

export default BeamSplitterNode;