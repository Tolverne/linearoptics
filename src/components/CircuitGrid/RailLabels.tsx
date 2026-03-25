import React from "react";

type RailLabelsProps = {
  railCount: number;
  rowHeight?: number;
};

const RailLabels: React.FC<RailLabelsProps> = ({
  railCount,
  rowHeight = 72,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: `repeat(${railCount}, ${rowHeight}px)`,
        width: 80,
        flexShrink: 0,
      }}
    >
      {Array.from({ length: railCount }, (_, rail) => (
        <div
          key={rail}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: 12,
            fontSize: 14,
            fontWeight: 600,
            color: "#334155",
            boxSizing: "border-box",
          }}
        >
          Rail {rail + 1}
        </div>
      ))}
    </div>
  );
};

export default RailLabels;