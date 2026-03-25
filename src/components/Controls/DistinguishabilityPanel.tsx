import React from "react";
import { useExperimentStore } from "@/store/useExperimentStore";

const DistinguishabilityPanel: React.FC = () => {
  const overlap = useExperimentStore((state) => state.overlap);
  const setOverlap = useExperimentStore((state) => state.setOverlap);

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
        Photon Overlap
      </div>

      <div
        style={{
          fontSize: 13,
          color: "#475569",
          lineHeight: 1.45,
          marginBottom: 14,
        }}
      >
        Controls how similar the photons are. Higher overlap means stronger
        quantum interference.
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={overlap}
          onChange={(event) => setOverlap(Number(event.target.value))}
          style={{
            width: "100%",
            cursor: "pointer",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#64748b",
          marginBottom: 12,
        }}
      >
        <span>Distinguishable</span>
        <span>Identical</span>
      </div>

      <div
        style={{
          padding: 12,
          borderRadius: 12,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#475569",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            Overlap value
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            {overlap.toFixed(2)}
          </div>
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#475569",
            textAlign: "right",
            lineHeight: 1.4,
          }}
        >
          0.00 = classical-like limit
          <br />
          1.00 = fully indistinguishable
        </div>
      </div>
    </div>
  );
};

export default DistinguishabilityPanel;