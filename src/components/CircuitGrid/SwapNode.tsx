import React from "react";
import type { SwapComponent } from "@/types/simulation";

type SwapNodeProps = {
  component: SwapComponent;
  rowHeight?: number;
  columnWidth?: number;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
};

const SwapNode: React.FC<SwapNodeProps> = ({
  component,
  rowHeight = 72,
  columnWidth = 96,
  isSelected = false,
  onSelect,
}) => {
  const topRail = Math.min(component.rails[0], component.rails[1]);
  const bottomRail = Math.max(component.rails[0], component.rails[1]);

  const width = columnWidth * 0.9;
  const height = (bottomRail - topRail + 1) * rowHeight;

  const xPad = columnWidth * 0.05;

  const strokeMain = isSelected ? "#d97706" : "#0f172a";
  const strokeGlow = isSelected
    ? "rgba(217,119,6,0.18)"
    : "rgba(15,23,42,0.08)";

  const eraseColor = "#f8fafc"; // matches CircuitGrid background
  const railYTop = 25;
  const railYBottom = 75;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(component.id)}
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
            fill="rgba(245,158,11,0.08)"
            stroke="rgba(217,119,6,0.25)"
            strokeWidth="1.5"
          />
        )}

        {/* erase inactive straight rail paths */}
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

        {/* lower fibre glow */}
        <path
          d="M 5 75 C 28 75, 34 75, 46 56"
          fill="none"
          stroke={strokeGlow}
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 54 44 C 66 25, 72 25, 95 25"
          fill="none"
          stroke={strokeGlow}
          strokeWidth="9"
          strokeLinecap="round"
        />

        {/* upper fibre glow */}
        <path
          d="M 5 25 C 28 25, 34 25, 50 50 C 66 75, 72 75, 95 75"
          fill="none"
          stroke={strokeGlow}
          strokeWidth="9"
          strokeLinecap="round"
        />

        {/* lower fibre main, broken at crossing so it looks underneath */}
        <path
          d="M 5 75 C 28 75, 34 75, 46 56"
          fill="none"
          stroke={strokeMain}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 54 44 C 66 25, 72 25, 95 25"
          fill="none"
          stroke={strokeMain}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* erase a tiny crossing gap for stronger under/over effect */}
        <circle cx="50" cy="50" r="6" fill={eraseColor} />

        {/* upper fibre main, continuous over the top */}
        <path
          d="M 5 25 C 28 25, 34 25, 50 50 C 66 75, 72 75, 95 75"
          fill="none"
          stroke={strokeMain}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
};

export default SwapNode;