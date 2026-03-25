import React from "react";
import { useExperimentStore } from "@/store/useExperimentStore";

const ClearButton: React.FC = () => {
  const clearCircuit = useExperimentStore((state) => state.clearCircuit);
  const setSelectedComponentId = useExperimentStore(
    (state) => state.setSelectedComponentId
  );
  const setResults = useExperimentStore((state) => state.setResults);
  const setError = useExperimentStore((state) => state.setError);

  const handleClear = () => {
    clearCircuit();
    setSelectedComponentId(null);
    setResults(null);
    setError(null);
  };

  return (
    <button
      type="button"
      onClick={handleClear}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        color: "#334155",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Clear Circuit
    </button>
  );
};

export default ClearButton;