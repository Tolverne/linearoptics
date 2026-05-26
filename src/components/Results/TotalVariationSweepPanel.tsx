import React, { useMemo } from "react";
import { useExperimentStore } from "@/store/useExperimentStore";
import type { OverlapSweepStep } from "@/types/simulation";

const CHART_WIDTH = 920;
const CHART_HEIGHT = 300;
const PADDING_LEFT = 58;
const PADDING_RIGHT = 24;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 46;

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

function makeHomValues(values: number[]): number[] {
    if (values.length <= 1) return values;
    return [...values, ...values.slice(0, -1).reverse()];
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

function findIndistinguishableIndex(overlapValues: number[]): number {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    overlapValues.forEach((value, index) => {
        const distance = Math.abs(value - 1);

        if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = index;
        }
    });

    return bestIndex;
}

function computeTotalVariationValues(step: OverlapSweepStep): number[] {
    const baselineIndex = findIndistinguishableIndex(step.overlapValues);

    return step.overlapValues.map((_, overlapIndex) => {
        const l1Distance = step.curves.reduce((sum, curve) => {
            const pIndistinguishable = curve.probabilities[baselineIndex] ?? 0;
            const pCurrent = curve.probabilities[overlapIndex] ?? 0;

            return sum + Math.abs(pIndistinguishable - pCurrent);
        }, 0);

        return 0.5 * l1Distance;
    });
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

const TotalVariationSweepPanel: React.FC = () => {
    const results = useExperimentStore((state) => state.results);
    const selectedStep = useExperimentStore((state) => state.selectedStep);
    const showHomDelay = useExperimentStore((state) => state.showHomDelayAxis);

    const sweepStep = useMemo(() => {
        return findSweepStepForColumn(results?.overlapSweep?.steps ?? [], selectedStep);
    }, [results?.overlapSweep?.steps, selectedStep]);

    if (!results) {
        return (
            <div style={panelStyle}>
                <PanelTitle />
                <EmptyMessage>
                    Run a simulation to generate the total-variation sweep.
                </EmptyMessage>
            </div>
        );
    }

    if (!results.overlapSweep || !sweepStep) {
        return (
            <div style={panelStyle}>
                <PanelTitle />
                <EmptyMessage>
                    Total-variation sweep data is not available. Run the experiment with
                    photon-overlap sweep enabled.
                </EmptyMessage>
            </div>
        );
    }

    const rawOverlapValues = sweepStep.overlapValues;
    const rawTvValues = computeTotalVariationValues(sweepStep);

    const xValues = showHomDelay
        ? makeHomDelayValues(rawOverlapValues)
        : rawOverlapValues;

    const tvValues = showHomDelay ? makeHomValues(rawTvValues) : rawTvValues;

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);

    const maxTv = Math.max(1e-9, ...tvValues);
    const yMax = Math.min(1, Math.max(0.05, maxTv * 1.08));

    const xAxisY = CHART_HEIGHT - PADDING_BOTTOM;
    const yAxisX = PADDING_LEFT;
    const plotWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    const path = makePath(xValues, tvValues, xMin, xMax, yMax);

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
                        Measures the total variation distance between the fully
                        indistinguishable output distribution and the distribution at each
                        photon-overlap value.
                    </div>
                </div>

                <div
                    style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        background: "#fefce8",
                        border: "1px solid #fde68a",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#854d0e",
                    }}
                >
                    Theory · Active column: {sweepStep.label}
                </div>
            </div>

            <div
                style={{
                    overflowX: "auto",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    background: "#f8fafc",
                }}
            >
                <div className="export-target">
                    <svg
                        width={CHART_WIDTH}
                        height={CHART_HEIGHT}
                        role="img"
                        aria-label="Total variation distance sweep graph"
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
                            TV distance
                        </text>

                        <path
                            d={path}
                            fill="none"
                            stroke="#7c3aed"
                            strokeWidth={2.7}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />

                        {xValues.map((xValue, index) => {
                            const tv = tvValues[index] ?? 0;
                            const xRatio = xMax === xMin ? 0 : (xValue - xMin) / (xMax - xMin);
                            const yRatio = yMax === 0 ? 0 : tv / yMax;
                            const cx = PADDING_LEFT + xRatio * plotWidth;
                            const cy = PADDING_TOP + (1 - yRatio) * plotHeight;

                            return (
                                <circle
                                    key={`${xValue}-${index}`}
                                    cx={cx}
                                    cy={cy}
                                    r={3}
                                    fill="#7c3aed"
                                >
                                    <title>
                                        {showHomDelay
                                            ? `τ/σ = ${xValue.toFixed(3)}`
                                            : `η = ${xValue.toFixed(3)}`}
                                        : TV = {tv.toFixed(4)}
                                    </title>
                                </circle>
                            );
                        })}
                    </svg>
                </div>
            </div>

            <div
                style={{
                    marginTop: 10,
                    fontSize: 13,
                    color: "#475569",
                    lineHeight: 1.5,
                }}
            >
                Baseline distribution: closest computed point to η = 1. The graph is
                zero at the fully indistinguishable distribution and increases as the
                output distribution moves away from it.
            </div>
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
                marginBottom: 6,
            }}
        >
            Total Variation Distance
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

export default TotalVariationSweepPanel;