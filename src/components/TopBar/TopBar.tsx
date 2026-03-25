import React from "react";
import ExampleSelector from "./ExampleSelector";
import RunButton from "./RunButton";
import ClearButton from "./ClearButton";
import ResetButton from "./ResetButton";
import { useExperimentStore } from "@/store/useExperimentStore";

const TopBar: React.FC = () => {
  const error = useExperimentStore((state) => state.error);

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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 4,
            }}
          >
            Linear Optics Lab Bench
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#475569",
              lineHeight: 1.4,
            }}
          >
            Build photonic circuits, vary photon overlap, and inspect output
            distributions.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <ExampleSelector />
          <ClearButton />
          <ResetButton />
          <RunButton />
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #fecaca",
            background: "#fef2f2",
            color: "#b91c1c",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default TopBar;