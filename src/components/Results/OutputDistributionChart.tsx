import React from "react";
import { useExperimentStore } from "@/store/useExperimentStore";
import type {
  BasisStateSummary,
  IntermediateState,
  Occupation,
  OverlapSweepStep,
  SampledDistributionEntry,
  SampledIntermediateState,
} from "@/types/simulation";

function formatOccupationAsKet(occupation: number[]): string {
  return `|${occupation.join(",")}⟩`;
}

function occupationsEqual(a: Occupation, b: Occupation): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

type ChartDatum = {
  label: string;
  occupation: Occupation;
  value: number;
};

type InspectorMode = "exact" | "sampled";

const BAR_MAX_HEIGHT = 220;

function exactStateToChartData(state: IntermediateState | null): ChartDatum[] {
  if (!state) return [];

  return state.basisStates.map((entry: BasisStateSummary) => ({
    label: formatOccupationAsKet(entry.occupation),
    occupation: entry.occupation,
    value: entry.probability,
  }));
}

function sampledStateToChartData(
  state: SampledIntermediateState | null
): ChartDatum[] {
  if (!state) return [];

  return state.basisStates.map((entry: SampledDistributionEntry) => ({
    label: formatOccupationAsKet(entry.occupation),
    occupation: entry.occupation,
    value: entry.frequency,
  }));
}

function sweepStepToChartData(
  step: OverlapSweepStep | null,
  selectedOverlap: number
): ChartDatum[] {
  if (!step || step.overlapValues.length === 0) return [];

  let closestIndex = 0;
  let closestDistance = Infinity;

  step.overlapValues.forEach((overlap, index) => {
    const distance = Math.abs(overlap - selectedOverlap);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return step.curves.map((curve) => ({
    label: formatOccupationAsKet(curve.occupation),
    occupation: curve.occupation,
    value: curve.probabilities[closestIndex] ?? 0,
  }));
}

function ModeToggle({
  mode,
  setMode,
  hasSampledData,
}: {
  mode: InspectorMode;
  setMode: (mode: InspectorMode) => void;
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

function findStateForSelectedColumn<T extends { column: number }>(
  states: T[],
  selectedColumn: number
): T | null {
  if (states.length === 0) return null;

  const exactMatch = states.find((state) => state.column === selectedColumn);
  if (exactMatch) return exactMatch;

  const safeIndex = Math.min(
    Math.max(selectedColumn, 0),
    Math.max(states.length - 1, 0)
  );

  return states[safeIndex] ?? null;
}



const OutputDistributionChart: React.FC = () => {
  const results = useExperimentStore((state) => state.results);
  const selectedStep = useExperimentStore((state) => state.selectedStep);
  const selectedOverlap = useExperimentStore((state) => state.overlap);
  const inspectorMode = useExperimentStore((state) => state.inspectorMode);
  const setInspectorMode = useExperimentStore((state) => state.setInspectorMode);
  const overlapSweep = useExperimentStore((state) => state.overlapSweep);
  const setOverlap = useExperimentStore((state) => state.setOverlap);

  const selectedSweepOccupations = useExperimentStore(
    (state) => state.selectedSweepOccupations
  );
  const toggleSweepOccupation = useExperimentStore(
    (state) => state.toggleSweepOccupation
  );

  if (!results) {
    return (
      <div style={panelStyle}>
        <PanelTitle />
        <EmptyMessage>
          Run a simulation to see the distribution for each circuit column.
        </EmptyMessage>
      </div>
    );
  }

  const exactStates: IntermediateState[] = results.intermediateStates ?? [];
  const sampledStates: SampledIntermediateState[] =
    results.sampledIntermediateStates ?? [];

  const hasSampledData = sampledStates.length > 0;
  const effectiveMode =
    inspectorMode === "sampled" && hasSampledData ? "sampled" : "exact";

  const currentExactState = findStateForSelectedColumn(exactStates, selectedStep);
  const currentSampledState = findStateForSelectedColumn(
    sampledStates,
    selectedStep
  );

  const theorySweepStep = findStateForSelectedColumn(
    results.overlapSweep?.steps ?? [],
    selectedStep
  );

  const sampledSweepStep = findStateForSelectedColumn(
    results.sampledOverlapSweep?.steps ?? [],
    selectedStep
  );

  const chartData =
  effectiveMode === "sampled"
    ? sampledSweepStep
      ? sweepStepToChartData(sampledSweepStep, selectedOverlap)
      : sampledStateToChartData(currentSampledState)
    : theorySweepStep
      ? sweepStepToChartData(theorySweepStep, selectedOverlap)
      : exactStateToChartData(currentExactState);

  const activeColumn =
  effectiveMode === "sampled"
    ? sampledSweepStep?.column ?? currentSampledState?.column
    : theorySweepStep?.column ?? currentExactState?.column;

  const currentColumnLabel =
    typeof activeColumn === "number"
      ? activeColumn >= 0
        ? `C${activeColumn + 1}`
        : "Input"
      : "No column selected";

  const dataSourceLabel =
  effectiveMode === "sampled"
    ? `experiment at overlap ${selectedOverlap.toFixed(2)}`
    : `theory at overlap ${selectedOverlap.toFixed(2)}`;

  if (chartData.length === 0) {
    return (
      <div style={panelStyle}>
        <PanelTitle />
        <EmptyMessage>
          No distribution data is available for the selected column.
        </EmptyMessage>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
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
          <PanelTitle />
          <div
            style={{
              fontSize: 13,
              color: "#475569",
              lineHeight: 1.5,
            }}
          >
            Click bars to add or remove output states from the photon-overlap
            sweep graph. In Theory mode, this chart follows the selected overlap
            value.
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
            setMode={setInspectorMode}
            hasSampledData={hasSampledData}
          />

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
            {currentColumnLabel}
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: effectiveMode === "sampled" ? "#fef3c7" : "#eff6ff",
              border:
                effectiveMode === "sampled"
                  ? "1px solid #fde68a"
                  : "1px solid #bfdbfe",
              fontSize: 13,
              fontWeight: 700,
              color: effectiveMode === "sampled" ? "#b45309" : "#1d4ed8",
            }}
          >
            {dataSourceLabel}
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
            minHeight: BAR_MAX_HEIGHT + 96,
            minWidth: Math.max(520, chartData.length * 96),
            padding: "16px 12px 8px 12px",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            background: "#f8fafc",
          }}
        >
          {chartData.map((entry) => {
            const barHeight = Math.max(2, entry.value * BAR_MAX_HEIGHT);
            const isSelectedForSweep = selectedSweepOccupations.some((current) =>
              occupationsEqual(current, entry.occupation)
            );

            return (
              <button
                type="button"
                key={entry.label}
                onClick={() => toggleSweepOccupation(entry.occupation)}
                title={`${entry.label}: ${entry.value.toFixed(
                  4
                )}. Click to toggle in overlap sweep graph.`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 72,
                  border: isSelectedForSweep
                    ? "2px solid #0f766e"
                    : "2px solid transparent",
                  borderRadius: 12,
                  background: isSelectedForSweep
                    ? "rgba(20, 184, 166, 0.10)"
                    : "transparent",
                  padding: "6px 4px",
                  cursor: "pointer",
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
                    style={{
                      width: 28,
                      height: barHeight,
                      borderRadius: "8px 8px 0 0",
                      background: isSelectedForSweep
                        ? "#0f766e"
                        : effectiveMode === "sampled"
                          ? "#f59e0b"
                          : "#2563eb",
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
              </button>
            );
          })}
        </div>
      </div>

          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
            }}
          >
            <label
              htmlFor="output-selected-overlap"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 800,
                color: "#475569",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}
            >
              Selected photon overlap
            </label>

            <input
              id="output-selected-overlap"
              type="range"
              min={overlapSweep.minOverlap}
              max={overlapSweep.maxOverlap}
              step={0.01}
              value={selectedOverlap}
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
              <span>{overlapSweep.minOverlap.toFixed(2)}</span>
              <span>Selected: {selectedOverlap.toFixed(2)}</span>
              <span>{overlapSweep.maxOverlap.toFixed(2)}</span>
            </div>
          </div>
          
      {selectedSweepOccupations.length > 0 && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "#475569",
          }}
        >
          {selectedSweepOccupations.length} output state
          {selectedSweepOccupations.length === 1 ? "" : "s"} selected for the
          overlap sweep graph.
        </div>
      )}
    </div>
  );
};

function PanelTitle() {
  return (
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
  );
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 16,
  background: "#ffffff",
  padding: 16,
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
};

export default OutputDistributionChart;