import React, { useMemo } from "react";
import { useExperimentStore } from "@/store/useExperimentStore";
import type {
  BasisStateSummary,
  IntermediateState,
  SampledDistributionEntry,
  SampledIntermediateState,
} from "@/types/simulation";

function formatOccupationAsKet(occupation: number[]): string {
  return `|${occupation.join(",")}⟩`;
}

function formatAmplitude(state: BasisStateSummary): string {
  if (
    typeof state.amplitudeRe !== "number" ||
    typeof state.amplitudeIm !== "number"
  ) {
    return "—";
  }

  const re = state.amplitudeRe.toFixed(4);
  const imAbs = Math.abs(state.amplitudeIm).toFixed(4);
  const sign = state.amplitudeIm >= 0 ? "+" : "-";

  return `${re} ${sign} ${imAbs}i`;
}

function StepButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: isActive ? "1px solid #2563eb" : "1px solid #cbd5e1",
        background: isActive ? "#dbeafe" : "#ffffff",
        color: isActive ? "#1d4ed8" : "#334155",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function ModeToggle({
  mode,
  setMode,
  hasSampledData,
}: {
  mode: "exact" | "sampled";
  setMode: (mode: "exact" | "sampled") => void;
  hasSampledData: boolean;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        border: "1px solid #cbd5e1",
        borderRadius: 12,
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <button
        type="button"
        onClick={() => setMode("exact")}
        style={{
          padding: "8px 12px",
          border: "none",
          background: mode === "exact" ? "#dbeafe" : "#ffffff",
          color: mode === "exact" ? "#1d4ed8" : "#334155",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Theory
      </button>

      <button
        type="button"
        onClick={() => hasSampledData && setMode("sampled")}
        disabled={!hasSampledData}
        style={{
          padding: "8px 12px",
          border: "none",
          borderLeft: "1px solid #cbd5e1",
          background: mode === "sampled" ? "#fef3c7" : "#ffffff",
          color: hasSampledData
            ? mode === "sampled"
              ? "#b45309"
              : "#334155"
            : "#94a3b8",
          fontSize: 13,
          fontWeight: 700,
          cursor: hasSampledData ? "pointer" : "not-allowed",
        }}
      >
        Experiment
      </button>
    </div>
  );
}

function ExactBasisStateRow({ state }: { state: BasisStateSummary }) {
  return (
    <tr>
      <td style={cellKetStyle}>{formatOccupationAsKet(state.occupation)}</td>
      <td style={cellMonoStyle}>{formatAmplitude(state)}</td>
      <td style={cellStyle}>{state.probability.toFixed(4)}</td>
    </tr>
  );
}

function SampledBasisStateRow({ state }: { state: SampledDistributionEntry }) {
  return (
    <tr>
      <td style={cellKetStyle}>{formatOccupationAsKet(state.occupation)}</td>
      <td style={cellStyle}>{state.count}</td>
      <td style={cellStyle}>{state.frequency.toFixed(4)}</td>
    </tr>
  );
}

const headerStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 800,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: 0.4,
  borderBottom: "1px solid #e2e8f0",
};

const cellStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: 13,
  color: "#334155",
};

const cellMonoStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #e2e8f0",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 13,
  color: "#334155",
};

const cellKetStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #e2e8f0",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 14,
  fontWeight: 700,
  color: "#0f172a",
};

const StateInspectorPanel: React.FC = () => {
  const results = useExperimentStore((state) => state.results);
  const selectedStep = useExperimentStore((state) => state.selectedStep);
  const setSelectedStep = useExperimentStore((state) => state.setSelectedStep);
  const mode = useExperimentStore((state) => state.inspectorMode);
  const setMode = useExperimentStore((state) => state.setInspectorMode);

  const intermediateStates: IntermediateState[] =
    results?.intermediateStates ?? [];

  const sampledIntermediateStates: SampledIntermediateState[] =
    results?.sampledIntermediateStates ?? [];

  const hasExactData = intermediateStates.length > 0;
  const hasSampledData = sampledIntermediateStates.length > 0;

  const effectiveMode =
    mode === "sampled" && !hasSampledData ? "exact" : mode;

  const stepCount =
    effectiveMode === "sampled"
      ? sampledIntermediateStates.length
      : intermediateStates.length;

  const safeIndex = Math.min(
    Math.max(selectedStep, 0),
    Math.max(stepCount - 1, 0)
  );

  const currentExactState = hasExactData ? intermediateStates[safeIndex] : null;
  const currentSampledState = hasSampledData
    ? sampledIntermediateStates[safeIndex]
    : null;

  const currentLabel =
    effectiveMode === "sampled"
      ? currentSampledState?.label
      : currentExactState?.label;

  const stepButtons = useMemo(() => {
    if (effectiveMode === "sampled") {
      return sampledIntermediateStates;
    }
    return intermediateStates;
  }, [effectiveMode, sampledIntermediateStates, intermediateStates]);

  if (!results || (!hasExactData && !hasSampledData)) {
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
          State Inspector
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: 13,
            color: "#475569",
            lineHeight: 1.5,
          }}
        >
          Run a simulation with intermediate states enabled to inspect the
          distribution after each stage of the circuit.
        </div>
      </div>
    );
  }

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
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 4,
            }}
          >
            State Inspector
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#475569",
            }}
          >
            View the distribution after each column of the circuit.
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
          <ModeToggle
            mode={effectiveMode}
            setMode={setMode}
            hasSampledData={hasSampledData}
          />

          <div
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background:
                effectiveMode === "sampled" ? "#fef3c7" : "#eff6ff",
              border:
                effectiveMode === "sampled"
                  ? "1px solid #fde68a"
                  : "1px solid #bfdbfe",
              fontSize: 13,
              fontWeight: 700,
              color: effectiveMode === "sampled" ? "#b45309" : "#1d4ed8",
            }}
          >
            {currentLabel ?? "No step selected"}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 6,
          marginBottom: 14,
        }}
      >
        {stepButtons.map((state, index) => (
          <StepButton
            key={`${state.step}-${state.label}`}
            label={state.label}
            isActive={index === safeIndex}
            onClick={() => setSelectedStep(index)}
          />
        ))}
      </div>

      <div
        style={{
          overflowX: "auto",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
        }}
      >
        {effectiveMode === "exact" ? (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 520,
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={headerStyle}>Basis state</th>
                <th style={headerStyle}>Amplitude</th>
                <th style={headerStyle}>Probability</th>
              </tr>
            </thead>

            <tbody>
              {!currentExactState || currentExactState.basisStates.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      padding: 16,
                      fontSize: 13,
                      color: "#64748b",
                    }}
                  >
                    No exact intermediate data available for this step.
                  </td>
                </tr>
              ) : (
                currentExactState.basisStates.map((basisState, index) => (
                  <ExactBasisStateRow
                    key={`${currentExactState.step}-${index}-${basisState.occupation.join(",")}`}
                    state={basisState}
                  />
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 520,
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={headerStyle}>Basis state</th>
                <th style={headerStyle}>Count</th>
                <th style={headerStyle}>Frequency</th>
              </tr>
            </thead>

            <tbody>
              {!currentSampledState ||
              currentSampledState.basisStates.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      padding: 16,
                      fontSize: 13,
                      color: "#64748b",
                    }}
                  >
                    No sampled intermediate data available for this step.
                  </td>
                </tr>
              ) : (
                currentSampledState.basisStates.map((basisState, index) => (
                  <SampledBasisStateRow
                    key={`${currentSampledState.step}-${index}-${basisState.occupation.join(",")}`}
                    state={basisState}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StateInspectorPanel;