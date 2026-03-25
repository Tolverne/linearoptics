import React from "react";
import { useExperimentStore } from "@/store/useExperimentStore";

function formatKet(state: number[]): string {
  return `|${state.join(",")}⟩`;
}

const MIN_RAILS = 2;
const MAX_RAILS = 6;

const InputStatePanel: React.FC = () => {
  const railCount = useExperimentStore((state) => state.railCount);
  const inputState = useExperimentStore((state) => state.inputState);
  const setRailCount = useExperimentStore((state) => state.setRailCount);
  const setInputPhoton = useExperimentStore((state) => state.setInputPhoton);

  const handleRailCountChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = Number(event.target.value);
    setRailCount(value);
  };

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
        Input State
      </div>

      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="rail-count"
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#334155",
            marginBottom: 6,
          }}
        >
          Number of rails
        </label>

        <select
          id="rail-count"
          value={railCount}
          onChange={handleRailCountChange}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            fontSize: 14,
            color: "#0f172a",
          }}
        >
          {Array.from(
            { length: MAX_RAILS - MIN_RAILS + 1 },
            (_, i) => MIN_RAILS + i
          ).map((count) => (
            <option key={count} value={count}>
              {count} rails
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {Array.from({ length: railCount }, (_, rail) => (
          <div
            key={rail}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 88px",
              gap: 10,
              alignItems: "center",
            }}
          >
            <label
              htmlFor={`rail-input-${rail}`}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#334155",
              }}
            >
              Rail {rail + 1}
            </label>

            <input
              id={`rail-input-${rail}`}
              type="number"
              min={0}
              step={1}
              value={inputState[rail] ?? 0}
              onChange={(event) =>
                setInputPhoton(rail, Math.max(0, Number(event.target.value)))
              }
              style={{
                width: "100%",
                padding: "9px 10px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                fontSize: 14,
                textAlign: "center",
                color: "#0f172a",
                background: "#ffffff",
              }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          padding: 12,
          borderRadius: 12,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#475569",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          Occupation state
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#0f172a",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          {formatKet(inputState.slice(0, railCount))}
        </div>
      </div>
    </div>
  );
};

export default InputStatePanel;