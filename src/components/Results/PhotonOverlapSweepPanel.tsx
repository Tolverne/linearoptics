import React, { useMemo } from "react";
import { useExperimentStore } from "@/store/useExperimentStore";
import type {
  Occupation,
  OverlapSweepCurve,
  OverlapSweepStep,
} from "@/types/simulation";

const CHART_WIDTH = 920;
const CHART_HEIGHT = 320;
const PADDING_LEFT = 58;
const PADDING_RIGHT = 24;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 46;

const LINE_COLORS = [
  "#2563eb",
  "#0f766e",
  "#dc2626",
  "#9333ea",
  "#d97706",
  "#0891b2",
  "#be123c",
  "#4f46e5",
];

function mirrorValues(values: number[], shouldMirror: boolean): number[] {
  if (!shouldMirror || values.length <= 1) return values;
  return [...values, ...values.slice(0, -1).reverse()];
}

function mirrorProbabilities(values: number[], shouldMirror: boolean): number[] {
  if (!shouldMirror || values.length <= 1) return values;
  return [...values, ...values.slice(0, -1).reverse()];
}

function delayFromOverlap(overlap: number, sigma = 1): number {
  const safeOverlap = Math.min(1, Math.max(1e-6, overlap));
  return sigma * Math.sqrt(-Math.log(safeOverlap));
}

function makeHomDelayValues(overlapValues: number[], sigma = 1): number[] {
  if (overlapValues.length <= 1) return [0];

  const negativeBranch = overlapValues.map(
    (overlap) => -delayFromOverlap(overlap, sigma)
  );

  const positiveBranch = overlapValues
    .slice(0, -1)
    .reverse()
    .map((overlap) => delayFromOverlap(overlap, sigma));

  return [...negativeBranch, ...positiveBranch];
}

function makeHomProbabilities(probabilities: number[]): number[] {
  if (probabilities.length <= 1) return probabilities;
  return [...probabilities, ...probabilities.slice(0, -1).reverse()];
}



function formatOccupationAsKet(occupation: Occupation): string {
  return `|${occupation.join(",")}⟩`;
}

function occupationsEqual(a: Occupation, b: Occupation): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function findSweepStepForColumn(
  steps: OverlapSweepStep[],
  selectedColumn: number
): OverlapSweepStep | null {
  if (steps.length === 0) return null;

  const exact = steps.find((step) => step.column === selectedColumn);
  if (exact) return exact;

  const safeIndex = Math.min(
    Math.max(selectedColumn, 0),
    Math.max(steps.length - 1, 0)
  );

  return steps[safeIndex] ?? null;
}

function curveMatchesSelections(
  curve: OverlapSweepCurve,
  selectedOccupations: Occupation[]
): boolean {
  return selectedOccupations.some((occupation) =>
    occupationsEqual(occupation, curve.occupation)
  );
}

function makePath(
  xs: number[],
  ys: number[],
  xMin: number,
  xMax: number,
  yMax: number
): string {
  const plotWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  if (xs.length === 0 || ys.length === 0) return "";

  return xs
    .map((x, index) => {
      const y = ys[index] ?? 0;

      const xRatio = xMax === xMin ? 0 : (x - xMin) / (xMax - xMin);
      const yRatio = yMax === 0 ? 0 : y / yMax;

      const px = PADDING_LEFT + xRatio * plotWidth;
      const py = PADDING_TOP + (1 - yRatio) * plotHeight;

      return `${index === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
    })
    .join(" ");
}


const PhotonOverlapSweepPanel: React.FC = () => {
  const [showHomDelay, setShowHomDelay] = React.useState(true);
  const results = useExperimentStore((state) => state.results);
  const selectedStep = useExperimentStore((state) => state.selectedStep);
  const selectedSweepOccupations = useExperimentStore(
    (state) => state.selectedSweepOccupations
  );
  const clearSweepOccupations = useExperimentStore(
    (state) => state.clearSweepOccupations
  );

  const sweepStep = useMemo(() => {
    return findSweepStepForColumn(results?.overlapSweep?.steps ?? [], selectedStep);
  }, [results?.overlapSweep?.steps, selectedStep]);

  const selectedCurves = useMemo(() => {
    if (!sweepStep) return [];

    return sweepStep.curves.filter((curve) =>
      curveMatchesSelections(curve, selectedSweepOccupations)
    );
  }, [sweepStep, selectedSweepOccupations]);

  if (!results) {
    return (
      <div style={panelStyle}>
        <PanelTitle />
        <EmptyMessage>
          Run a simulation to generate photon-overlap probability curves.
        </EmptyMessage>
      </div>
    );
  }

  if (!results.overlapSweep) {
    return (
      <div style={panelStyle}>
        <PanelTitle />
        <EmptyMessage>
          Photon-overlap sweep data is not available. Enable the sweep controls
          and run the experiment again.
        </EmptyMessage>
      </div>
    );
  }

  if (!sweepStep) {
    return (
      <div style={panelStyle}>
        <PanelTitle />
        <EmptyMessage>
          No sweep data is available for the selected circuit column.
        </EmptyMessage>
      </div>
    );
  }

  if (selectedSweepOccupations.length === 0) {
    return (
      <div style={panelStyle}>
        <PanelHeader label={sweepStep.label} />
        <EmptyMessage>
          Click one or more bars in the Output Distribution panel to add output
          states to this graph.
        </EmptyMessage>
      </div>
    );
  }

    const shouldMirrorGraph = Boolean(results.overlapSweep.returnToStart);

    const rawOverlapValues = sweepStep.overlapValues;

    const xValues = showHomDelay
    ? makeHomDelayValues(rawOverlapValues)
    : rawOverlapValues;

    const displayedCurves = selectedCurves.map((curve) => ({
    ...curve,
    probabilities: showHomDelay
        ? makeHomProbabilities(curve.probabilities)
        : curve.probabilities,
    }));

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);

  const maxProbability = Math.max(
    1e-9,
    ...displayedCurves.flatMap((curve) => curve.probabilities)
  );

  const yMax = Math.min(1, Math.max(0.05, maxProbability * 1.08));

  const xAxisY = CHART_HEIGHT - PADDING_BOTTOM;
  const yAxisX = PADDING_LEFT;
  const plotWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  

  return (
    <div style={panelStyle}>
        <label
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 10,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontSize: 13,
                fontWeight: 700,
                color: "#334155",
                cursor: "pointer",
            }}
            >
            <input
                type="checkbox"
                checked={showHomDelay}
                onChange={(event) => setShowHomDelay(event.target.checked)}
            />
            <span>HOM-style delay axis</span>
            </label>
      <PanelHeader label={sweepStep.label} />

      {displayedCurves.length === 0 ? (
        <EmptyMessage>
          The selected output state is not present in this sweep data. Try
          selecting another output state from the distribution chart.
        </EmptyMessage>
      ) : (
        <>
          <div
            style={{
              overflowX: "auto",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              background: "#f8fafc",
            }}
          >
            <svg
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              role="img"
              aria-label="Photon overlap sweep graph"
              style={{ display: "block" }}
            >
              <line
                x1={yAxisX}
                y1={PADDING_TOP}
                x2={yAxisX}
                y2={xAxisY}
                stroke="#334155"
                strokeWidth={1.5}
              />
              <line
                x1={PADDING_LEFT}
                y1={xAxisY}
                x2={CHART_WIDTH - PADDING_RIGHT}
                y2={xAxisY}
                stroke="#334155"
                strokeWidth={1.5}
              />

              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                const yValue = yMax * fraction;
                const y = PADDING_TOP + (1 - fraction) * plotHeight;

                return (
                  <g key={`y-${fraction}`}>
                    <line
                      x1={PADDING_LEFT}
                      y1={y}
                      x2={CHART_WIDTH - PADDING_RIGHT}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth={1}
                    />
                    <text
                      x={PADDING_LEFT - 10}
                      y={y + 4}
                      textAnchor="end"
                      fontSize={11}
                      fill="#64748b"
                    >
                      {yValue.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                const xValue = xMin + (xMax - xMin) * fraction;
                const x = PADDING_LEFT + fraction * plotWidth;

                return (
                  <g key={`x-${fraction}`}>
                    <line
                      x1={x}
                      y1={PADDING_TOP}
                      x2={x}
                      y2={xAxisY}
                      stroke="#e2e8f0"
                      strokeWidth={1}
                    />
                    <text
                      x={x}
                      y={xAxisY + 22}
                      textAnchor="middle"
                      fontSize={11}
                      fill="#64748b"
                    >
                      {xValue.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              <text
                x={PADDING_LEFT + plotWidth / 2}
                y={CHART_HEIGHT - 10}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fill="#334155"
              >
                {showHomDelay ? "Relative photon delay τ / σ" : "Photon overlap η"}
              </text>

              <text
                x={16}
                y={PADDING_TOP + plotHeight / 2}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fill="#334155"
                transform={`rotate(-90 16 ${PADDING_TOP + plotHeight / 2})`}
              >
                Probability
              </text>

              {displayedCurves.map((curve, index) => {
                const color = LINE_COLORS[index % LINE_COLORS.length];
                const path = makePath(
                            xValues,
                            curve.probabilities,
                            xMin,
                            xMax,
                            yMax
                            );

                return (
                  <g key={curve.occupation.join(",")}>
                    <path
                      d={path}
                      fill="none"
                      stroke={color}
                      strokeWidth={2.5}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />

                    {xValues.map((xValue, pointIndex) => {
                      const probability = curve.probabilities[pointIndex] ?? 0;
                      const xRatio =
                        xMax === xMin ? 0 : (xValue - xMin) / (xMax - xMin);
                      const yRatio = yMax === 0 ? 0 : probability / yMax;
                      const cx = PADDING_LEFT + xRatio * plotWidth;
                      const cy = PADDING_TOP + (1 - yRatio) * plotHeight;

                      return (
                        <circle
                          key={`${curve.occupation.join(",")}-${pointIndex}`}
                          cx={cx}
                          cy={cy}
                          r={3}
                          fill={color}
                        >
                            <title>
                            {formatOccupationAsKet(curve.occupation)} at{" "}
                            {showHomDelay
                                ? `τ/σ = ${xValue.toFixed(3)}`
                                : `η = ${xValue.toFixed(3)}`}
                            : {probability.toFixed(4)}
                            </title>
                        </circle>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 12,
              alignItems: "center",
            }}
          >
            {displayedCurves.map((curve, index) => {
              const color = LINE_COLORS[index % LINE_COLORS.length];

              return (
                <div
                  key={curve.occupation.join(",")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    borderRadius: 999,
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 999,
                      background: color,
                      display: "inline-block",
                    }}
                  />
                  {formatOccupationAsKet(curve.occupation)}
                </div>
              );
            })}

            <button
              type="button"
              onClick={clearSweepOccupations}
              style={{
                marginLeft: "auto",
                padding: "7px 10px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Clear selected outputs
            </button>
          </div>
        </>
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
        marginBottom: 12,
      }}
    >
      Photon Overlap Sweep
    </div>
  );
}

function PanelHeader({ label }: { label: string }) {
  return (
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
          Shows how selected output probabilities change as photon overlap varies.
          Click output bars above to add or remove curves.
        </div>
      </div>

      <div
        style={{
          padding: "8px 12px",
          borderRadius: 10,
          background: "#ecfeff",
          border: "1px solid #a5f3fc",
          fontSize: 13,
          fontWeight: 700,
          color: "#0e7490",
        }}
      >
        Active column: {label}
      </div>


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

export default PhotonOverlapSweepPanel;