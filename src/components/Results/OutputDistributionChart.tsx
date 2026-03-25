import React from "react";
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

type ChartDatum = {
  label: string;
  value: number;
  secondaryValue?: number;
};

const BAR_MAX_HEIGHT = 220;

function exactStateToChartData(state: IntermediateState | null): ChartDatum[] {
  if (!state) return [];

  return state.basisStates.map((entry: BasisStateSummary) => ({
    label: formatOccupationAsKet(entry.occupation),
    value: entry.probability,
  }));
}

function sampledStateToChartData(
  state: SampledIntermediateState | null
): ChartDatum[] {
  if (!state) return [];

  return state.basisStates.map((entry: SampledDistributionEntry) => ({
    label: formatOccupationAsKet(entry.occupation),
    value: entry.frequency,
  }));
}

const OutputDistributionChart: React.FC = () => {
  const results = useExperimentStore((state) => state.results);
  const selectedStep = useExperimentStore((state) => state.selectedStep);
  const inspectorMode = useExperimentStore((state) => state.inspectorMode);

  if (!results) {
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
          Output Distribution
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
          Run a simulation to see the distribution at each stage of the circuit.
        </div>
      </div>
    );
  }

  const exactStates: IntermediateState[] = results.intermediateStates ?? [];
  const sampledStates: SampledIntermediateState[] =
    results.sampledIntermediateStates ?? [];

  const hasSampledData = sampledStates.length > 0;
  const effectiveMode =
    inspectorMode === "sampled" && hasSampledData ? "sampled" : "exact";

  const stepCount =
    effectiveMode === "sampled" ? sampledStates.length : exactStates.length;

  const safeIndex = Math.min(Math.max(selectedStep, 0), Math.max(stepCount - 1, 0));

  const currentExactState =
    exactStates.length > 0 ? exactStates[safeIndex] ?? null : null;
  const currentSampledState =
    sampledStates.length > 0 ? sampledStates[safeIndex] ?? null : null;

  const chartData =
    effectiveMode === "sampled"
      ? sampledStateToChartData(currentSampledState)
      : exactStateToChartData(currentExactState);

  const currentLabel =
    effectiveMode === "sampled"
      ? currentSampledState?.label
      : currentExactState?.label;

  if (chartData.length === 0) {
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
          Output Distribution
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
          No distribution data is available for the selected stage.
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
            Output Distribution
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#475569",
            }}
          >
            Showing the distribution for the currently selected stage.
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
            {effectiveMode === "sampled" ? "Experiment" : "Theory"}
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontSize: 13,
              fontWeight: 700,
              color: "#334155",
            }}
          >
            {currentLabel ?? "No step selected"}
          </div>
        </div>
      </div>

      <div
        style={{
          overflowX: "auto",
          paddingBottom: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 18,
            minHeight: BAR_MAX_HEIGHT + 80,
            minWidth: Math.max(520, chartData.length * 90),
            padding: "16px 12px 8px 12px",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            background: "#f8fafc",
          }}
        >
          {chartData.map((entry) => {
            const barHeight = Math.max(2, entry.value * BAR_MAX_HEIGHT);

            return (
              <div
                key={entry.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 72,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#334155",
                    minHeight: 16,
                  }}
                >
                  {entry.value.toFixed(3)}
                </div>

                <div
                  style={{
                    height: BAR_MAX_HEIGHT,
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <div
                    title={`${entry.label}: ${entry.value.toFixed(4)}`}
                    style={{
                      width: 28,
                      height: barHeight,
                      borderRadius: "8px 8px 0 0",
                      background:
                        effectiveMode === "sampled" ? "#f59e0b" : "#2563eb",
                    }}
                  />
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#0f172a",
                    textAlign: "center",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    wordBreak: "break-word",
                  }}
                >
                  {entry.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OutputDistributionChart;