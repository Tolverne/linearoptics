import React from "react";
import { useExperimentStore } from "@/store/useExperimentStore";
import { simulateCircuit } from "@/lib/api/simulate";
import type { SimulationRequest } from "@/types/simulation";

const RunButton: React.FC = () => {
  const railCount = useExperimentStore((state) => state.railCount);
  const inputState = useExperimentStore((state) => state.inputState);
  const components = useExperimentStore((state) => state.components);
  const overlap = useExperimentStore((state) => state.overlap);
  const shots = useExperimentStore((state) => state.shots);
  const includeSamples = useExperimentStore((state) => state.includeSamples);
  const includeIntermediateStates = useExperimentStore(
    (state) => state.includeIntermediateStates
  );
  const isRunning = useExperimentStore((state) => state.isRunning);

  const setResults = useExperimentStore((state) => state.setResults);
  const setError = useExperimentStore((state) => state.setError);
  const setIsRunning = useExperimentStore((state) => state.setIsRunning);

  const handleRun = async () => {
    const payload: SimulationRequest = {
      railCount,
      inputState: inputState.slice(0, railCount),
      components,
      distinguishability: {
        model: "global_overlap",
        overlap,
      },
      options: {
        includeIntermediateStates,
        shots,
        includeSamples,
        maxDisplayedBasisStates: 32,
      },
    };

    try {
      setError(null);
      setIsRunning(true);

      const response = await simulateCircuit(payload);
      setResults(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Simulation failed.";
      setError(message);
      setResults(null);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRun}
      disabled={isRunning}
      style={{
        padding: "10px 16px",
        borderRadius: 12,
        border: "1px solid #2563eb",
        background: isRunning ? "#93c5fd" : "#2563eb",
        color: "#ffffff",
        fontSize: 14,
        fontWeight: 700,
        cursor: isRunning ? "not-allowed" : "pointer",
        boxShadow: "0 3px 10px rgba(37, 99, 235, 0.18)",
      }}
    >
      {isRunning ? "Running..." : "Run Experiment"}
    </button>
  );
};

export default RunButton;