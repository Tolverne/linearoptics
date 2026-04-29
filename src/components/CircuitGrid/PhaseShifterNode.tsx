import React from "react";
import type { PhaseShifterComponent } from "@/types/simulation";
import { useExperimentStore } from "@/store/useExperimentStore";
import { formatNiceNumber } from "@/utils/formatNumber";




type PhaseShifterNodeProps = {
  component: PhaseShifterComponent;
  rowHeight?: number;
  columnWidth?: number;
  isSelected?: boolean;
  onSelect?: () => void;
};



const PhaseShifterNode: React.FC<PhaseShifterNodeProps> = ({
  component,
  rowHeight = 72,
  columnWidth = 96,
  isSelected = false,
  onSelect,
}) => {
    const mode = useExperimentStore((state) => state.numericDisplayMode);
    const phiLabel = formatNiceNumber(component.params.phi, {
        mode,
        decimalPlaces: 3,
    });
  return (
    <button
      type="button"
      onClick={onSelect}
          title={`Phase Shifter (φ = ${phiLabel})`}
      style={{
        position: "absolute",
        left: component.column * columnWidth + columnWidth * 0.24,
        top: component.rail * rowHeight + rowHeight * 0.24,
        width: columnWidth * 0.52,
        height: rowHeight * 0.52,
        borderRadius: 10,
        border: isSelected ? "2px solid #7c3aed" : "2px solid #334155",
        background: isSelected ? "#ede9fe" : "#ffffff",
        boxShadow: isSelected
          ? "0 0 0 3px rgba(124, 58, 237, 0.12)"
          : "0 2px 5px rgba(15, 23, 42, 0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 4,
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#4c1d95",
          lineHeight: 1,
        }}
      >
        φ
      </div>
      <div
        style={{
          fontSize: 9,
          color: "#6b7280",
          marginTop: 2,
        }}
      >
              {phiLabel}
      </div>
    </button>
  );
};

export default PhaseShifterNode;