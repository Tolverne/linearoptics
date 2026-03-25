import React from "react";
import type { ToolboxItemType } from "@/types/simulation";

type ToolboxItemProps = {
  toolType: ToolboxItemType;
  label: string;
  description: string;
};

function getToolVisual(toolType: ToolboxItemType): React.ReactNode {
  if (toolType === "beam_splitter") {
    return (
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          border: "2px solid #0f172a",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 12,
          color: "#0f172a",
        }}
      >
        BS
      </div>
    );
  }

  if (toolType === "phase_shifter") {
    return (
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          border: "2px solid #7c3aed",
          background: "#faf5ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 18,
          color: "#4c1d95",
        }}
      >
        φ
      </div>
    );
  }

  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 10,
        border: "2px solid #d97706",
        background: "#fffbeb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#92400e",
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      ↔
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
        borderRadius: 14,
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        cursor: "grab",
        userSelect: "none",
        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.05)",
      }}
    >
      {getToolVisual(toolType)}

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#475569",
            lineHeight: 1.35,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};

export default ToolboxItem;