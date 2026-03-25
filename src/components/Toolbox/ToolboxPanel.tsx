import React from "react";
import ToolboxItem from "./ToolboxItem";

const ToolboxPanel: React.FC = () => {
  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: 16,
        background: "#ffffff",
        padding: 16,
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 8,
        }}
      >
        Toolbox
      </div>

      <div
        style={{
          fontSize: 13,
          color: "#475569",
          lineHeight: 1.45,
          marginBottom: 14,
        }}
      >
        Drag a component onto the circuit grid to place it on the rails.
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <ToolboxItem
          toolType="beam_splitter"
          label="Beam Splitter"
          description="Acts on two adjacent rails. Default setting is a 50:50 beam splitter."
        />

        <ToolboxItem
          toolType="phase_shifter"
          label="Phase Shifter"
          description="Applies a phase to a single rail."
        />

        <ToolboxItem
          toolType="swap"
          label="Swap"
          description="Exchanges two adjacent rails. Useful for routing dual-rail paths."
        />
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 12,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          fontSize: 12,
          color: "#475569",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "#0f172a" }}>Tip:</strong> drop a beam splitter
        or swap onto the upper of the two rails you want to use. Dropping lower
        down will still snap it into a valid adjacent pair where possible.
      </div>
    </div>
  );
};

export default ToolboxPanel;