import React from "react";
import { useExperimentStore } from "@/store/useExperimentStore";

const SimulationOptionsPanel: React.FC = () => {
  const shots = useExperimentStore((state) => state.shots);
  const includeSamples = useExperimentStore((state) => state.includeSamples);
  const includeIntermediateStates = useExperimentStore(
    (state) => state.includeIntermediateStates
  );

  const setShots = useExperimentStore((state) => state.setShots);

  // These may not yet exist in your store. If not, add them there:
  const setIncludeSamples =
    useExperimentStore.getState().setIncludeSamples ??
    ((_: boolean) => undefined);

  const setIncludeIntermediateStates =
    useExperimentStore.getState().setIncludeIntermediateStates ??
    ((_: boolean) => undefined);

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
          marginBottom: 12,
        }}
      >
        Simulation Options
      </div>

      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="shots-input"
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#334155",
            marginBottom: 6,
          }}
        >
          Number of shots
        </label>

        <input
          id="shots-input"
          type="number"
          min={1}
          step={100}
          value={shots}
          onChange={(event) =>
            setShots(Math.max(1, Number(event.target.value)))
          }
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            fontSize: 14,
            color: "#0f172a",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "#334155",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={includeSamples}
            onChange={(event) => setIncludeSamples(event.target.checked)}
          />
          Include sampled distribution
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "#334155",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={includeIntermediateStates}
            onChange={(event) =>
              setIncludeIntermediateStates(event.target.checked)
            }
          />
          Include intermediate states
        </label>
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
          lineHeight: 1.45,
        }}
      >
        Use sampled results to mimic finite experimental runs. Intermediate
        states are useful for step-by-step teaching and debugging.
      </div>
    </div>
  );
};

export default SimulationOptionsPanel;