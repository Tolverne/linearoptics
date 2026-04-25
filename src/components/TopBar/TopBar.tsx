import React from "react";
import ExampleSelector from "./ExampleSelector";
import RunButton from "./RunButton";
import ClearButton from "./ClearButton";
import ResetButton from "./ResetButton";
import { useExperimentStore } from "@/store/useExperimentStore";

const numberInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  fontSize: 14,
  color: "#0f172a",
  fontWeight: 600,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#475569",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const TopBar: React.FC = () => {
  const error = useExperimentStore((state) => state.error);

  const overlap = useExperimentStore((state) => state.overlap);
  const setOverlap = useExperimentStore((state) => state.setOverlap);

  const shots = useExperimentStore((state) => state.shots);
  const setShots = useExperimentStore((state) => state.setShots);

  const overlapSweep = useExperimentStore((state) => state.overlapSweep);
  const setOverlapSweep = useExperimentStore((state) => state.setOverlapSweep);

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
              maxWidth: 620,
            }}
          >
            Build photonic circuits, vary photon overlap, inspect output
            distributions, and compare experimental samples with theoretical
            predictions.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 10,
            minWidth: 560,
            maxWidth: 760,
            flex: "1 1 560px",
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
              <label htmlFor="topbar-overlap" style={labelStyle}>
                Current photon overlap
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
              <label htmlFor="topbar-shots" style={labelStyle}>
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
                style={numberInputStyle}
              />
            </div>
          </div>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              background: "#f8fafc",
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: 2,
                  }}
                >
                  Photon overlap sweep
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    lineHeight: 1.4,
                  }}
                >
                  Used to generate probability curves such as the HOM dip.
                </div>
              </div>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={overlapSweep.enabled}
                  onChange={(event) =>
                    setOverlapSweep({ enabled: event.target.checked })
                  }
                />
                Enable sweep
              </label>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(110px, 1fr))",
                gap: 12,
                alignItems: "end",
                opacity: overlapSweep.enabled ? 1 : 0.5,
              }}
            >
              <div>
                <label htmlFor="sweep-min-overlap" style={labelStyle}>
                  Min overlap
                </label>
                <input
                  id="sweep-min-overlap"
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={overlapSweep.minOverlap}
                  disabled={!overlapSweep.enabled}
                  onChange={(event) =>
                    setOverlapSweep({
                      minOverlap: Number(event.target.value),
                    })
                  }
                  style={numberInputStyle}
                />
              </div>

              <div>
                <label htmlFor="sweep-max-overlap" style={labelStyle}>
                  Max overlap
                </label>
                <input
                  id="sweep-max-overlap"
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={overlapSweep.maxOverlap}
                  disabled={!overlapSweep.enabled}
                  onChange={(event) =>
                    setOverlapSweep({
                      maxOverlap: Number(event.target.value),
                    })
                  }
                  style={numberInputStyle}
                />
              </div>

              <div>
                <label htmlFor="sweep-points" style={labelStyle}>
                  Overlap values
                </label>
                <input
                  id="sweep-points"
                  type="number"
                  min={2}
                  max={101}
                  step={1}
                  value={overlapSweep.points}
                  disabled={!overlapSweep.enabled}
                  onChange={(event) =>
                    setOverlapSweep({
                      points: Number(event.target.value),
                    })
                  }
                  style={numberInputStyle}
                />
              </div>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 0",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#334155",
                  cursor: overlapSweep.enabled ? "pointer" : "not-allowed",
                }}
              >
                <input
                  type="checkbox"
                  checked={overlapSweep.returnToStart}
                  disabled={!overlapSweep.enabled}
                  onChange={(event) =>
                    setOverlapSweep({
                      returnToStart: event.target.checked,
                    })
                  }
                />
                Return to start
              </label>
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