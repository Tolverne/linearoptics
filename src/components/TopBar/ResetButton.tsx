import React from "react";
import { useExperimentStore } from "@/store/useExperimentStore";

const ResetButton: React.FC = () => {
  const resetAll = useExperimentStore((state) => state.resetAll);

  return (
    <button
      type="button"
      onClick={resetAll}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid #cbd5e1",
        background: "#f8fafc",
        color: "#0f172a",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Reset All
    </button>
  );
};

export default ResetButton;