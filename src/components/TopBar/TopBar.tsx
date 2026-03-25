import React from "react";
import ExampleSelector from "./ExampleSelector";
import RunButton from "./RunButton";
import ClearButton from "./ClearButton";
import ResetButton from "./ResetButton";
import { useExperimentStore } from "@/store/useExperimentStore";

const TopBar: React.FC = () => {
  const error = useExperimentStore((state) => state.error);
  const overlap = useExperimentStore((state) => state.overlap);
  const setOverlap = useExperimentStore((state) => state.setOverlap);
  const shots = useExperimentStore((state) => state.shots);
  const setShots = useExperimentStore((state) => state.setShots);

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
          alignItems: "flex-start",
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
            display: "grid",
            gap: 10,
            minWidth: 420,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <ExampleSelector />
            <ClearButton />
            <ResetButton />
            <RunButton />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 140px",
              gap: 12,
              alignItems: "end",
            }}
          >
            <div>
              <label
                htmlFor="topbar-overlap"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#475569",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                Photon overlap
              </label>

              <input
                id="topbar-overlap"
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

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#64748b",
                  marginTop: 4,
                }}
              >
                <span>Distinguishable</span>
                <span>{overlap.toFixed(2)}</span>
                <span>Identical</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="topbar-shots"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#475569",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                Samples
              </label>

              <input
                id="topbar-shots"
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
                  fontWeight: 600,
                }}
              />
            </div>
          </div>
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