import React, { useEffect, useMemo, useState } from "react";
import { useExperimentStore } from "@/store/useExperimentStore";
import type {
    BasisStateSummary,
    IntermediateState,
    Occupation,
    OverlapSweepStep,
    PostSelectionCondition,
    PostSelectionConfig,
    SampledDistributionEntry,
    SampledIntermediateState,
} from "@/types/simulation";

const OUTCOMES_PER_PAGE = 10;
const AUTO_SELECTED_SWEEP_COUNT = 3;
const BAR_MAX_HEIGHT = 220;

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

type PostSelectedChartData = {
    data: ChartDatum[];
    successProbability: number;
    successfulOutcomeCount: number;
    totalOutcomeCount: number;
};

function measuredRailsForCondition(condition: PostSelectionCondition): number[] {
    if (condition.type === "rail_equals") {
        return [condition.rail];
    }

    return condition.rails;
}

function conditionMatches(
    occupation: Occupation,
    condition: PostSelectionCondition
): boolean {
    if (condition.type === "rail_equals") {
        return (occupation[condition.rail] ?? 0) === condition.photonCount;
    }

    if (condition.type === "rail_group_total") {
        const total = condition.rails.reduce(
            (sum, rail) => sum + (occupation[rail] ?? 0),
            0
        );

        return total === condition.photonCount;
    }

    if (condition.type === "rail_group_pattern") {
        return condition.rails.every(
            (rail, index) => (occupation[rail] ?? 0) === condition.pattern[index]
        );
    }

    return false;
}

function occupationMatchesPostSelection(
    occupation: Occupation,
    config: PostSelectionConfig
): boolean {
    if (!config.enabled || config.conditions.length === 0) return true;

    return config.conditions.every((condition) =>
        conditionMatches(occupation, condition)
    );
}

function applyPostSelection(
    data: ChartDatum[],
    config: PostSelectionConfig
): PostSelectedChartData {
    if (!config.enabled || config.conditions.length === 0) {
        return {
            data,
            successProbability: 1,
            successfulOutcomeCount: data.length,
            totalOutcomeCount: data.length,
        };
    }

    const measuredRails = new Set(
        config.conditions.flatMap((condition) =>
            measuredRailsForCondition(condition)
        )
    );

    const successfulData = data.filter((entry) =>
        occupationMatchesPostSelection(entry.occupation, config)
    );

    const successProbability = successfulData.reduce(
        (sum, entry) => sum + entry.value,
        0
    );

    const collapsedByVisibleOccupation = new Map<string, ChartDatum>();

    for (const entry of successfulData) {
        const visibleOccupation = config.hideMeasuredRails
            ? entry.occupation.filter((_, rail) => !measuredRails.has(rail))
            : entry.occupation;

        const key = visibleOccupation.join(",");

        const value =
            config.renormalise && successProbability > 0
                ? entry.value / successProbability
                : entry.value;

        const existing = collapsedByVisibleOccupation.get(key);

        if (existing) {
            existing.value += value;
        } else {
            collapsedByVisibleOccupation.set(key, {
                label: formatOccupationAsKet(visibleOccupation),
                occupation: visibleOccupation,
                value,
            });
        }
    }

    return {
        data: [...collapsedByVisibleOccupation.values()],
        successProbability,
        successfulOutcomeCount: successfulData.length,
        totalOutcomeCount: data.length,
    };
}

function makeId(prefix: string): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function parseRailList(value: string): number[] {
    return value
        .split(",")
        .map((part) => Number(part.trim()))
        .filter((value) => Number.isInteger(value) && value >= 0);
}

function parsePattern(value: string): number[] {
    return value
        .split(",")
        .map((part) => Number(part.trim()))
        .filter((value) => Number.isInteger(value) && value >= 0);
}



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

function conditionSummary(condition: PostSelectionCondition): string {
    if (condition.type === "rail_equals") {
        return `rail ${condition.rail} = ${condition.photonCount}`;
    }

    if (condition.type === "rail_group_total") {
        return `rails [${condition.rails.join(", ")}] total = ${condition.photonCount
            }`;
    }

    return `rails [${condition.rails.join(", ")}] pattern = [${condition.pattern.join(
        ", "
    )}]`;
}

function PostSelectionControls({
    railCount,
    config,
    setEnabled,
    addCondition,
    updateCondition,
    removeCondition,
    setHideMeasuredRails,
    setRenormalise,
    clearConditions,
    successProbability,
    successfulOutcomeCount,
    totalOutcomeCount,
}: {
    railCount: number;
    config: PostSelectionConfig;
    setEnabled: (enabled: boolean) => void;
    addCondition: (condition: PostSelectionCondition) => void;
    updateCondition: (
        id: string,
        patch: Partial<PostSelectionCondition>
    ) => void;
    removeCondition: (id: string) => void;
    setHideMeasuredRails: (hideMeasuredRails: boolean) => void;
    setRenormalise: (renormalise: boolean) => void;
    clearConditions: () => void;
    successProbability: number;
    successfulOutcomeCount: number;
    totalOutcomeCount: number;
}) {
    function addRailEquals() {
        addCondition({
            id: makeId("ps"),
            type: "rail_equals",
            rail: 0,
            photonCount: 1,
        });
    }

    function addGroupTotal() {
        addCondition({
            id: makeId("ps"),
            type: "rail_group_total",
            rails: [0, 1].filter((rail) => rail < railCount),
            photonCount: 1,
        });
    }

    function addGroupPattern() {
        addCondition({
            id: makeId("ps"),
            type: "rail_group_pattern",
            rails: [0, 1].filter((rail) => rail < railCount),
            pattern: [1, 0].slice(0, Math.min(2, railCount)),
        });
    }

    function addDualRailValid() {
        addCondition({
            id: makeId("ps"),
            type: "rail_group_total",
            rails: [0, 1].filter((rail) => rail < railCount),
            photonCount: 1,
        });
    }

    return (
        <div
            style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: 10,
                }}
            >
                <label
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#0f172a",
                    }}
                >
                    <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(event) => setEnabled(event.target.checked)}
                    />
                    Enable post-selection
                </label>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={addRailEquals}>
                        + Rail equals
                    </button>

                    <button type="button" onClick={addGroupTotal}>
                        + Group total
                    </button>

                    <button type="button" onClick={addGroupPattern}>
                        + Group pattern
                    </button>

                    <button type="button" onClick={addDualRailValid}>
                        + Dual-rail valid
                    </button>

                    <button type="button" onClick={clearConditions}>
                        Clear
                    </button>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gap: 10,
                    opacity: config.enabled ? 1 : 0.55,
                }}
            >
                {config.conditions.length === 0 ? (
                    <div
                        style={{
                            fontSize: 13,
                            color: "#64748b",
                            lineHeight: 1.5,
                        }}
                    >
                        Add one or more conditions. Conditions are combined with AND.
                    </div>
                ) : (
                    config.conditions.map((condition) => (
                        <div
                            key={condition.id}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "160px 1fr auto",
                                gap: 10,
                                alignItems: "center",
                                padding: 10,
                                borderRadius: 12,
                                border: "1px solid #e2e8f0",
                                background: "#ffffff",
                            }}
                        >
                            <select
                                disabled={!config.enabled}
                                value={condition.type}
                                onChange={(event) => {
                                    const nextType = event.target
                                        .value as PostSelectionCondition["type"];

                                    if (nextType === "rail_equals") {
                                        updateCondition(condition.id, {
                                            type: "rail_equals",
                                            rail: 0,
                                            photonCount: 1,
                                        } as Partial<PostSelectionCondition>);
                                    } else if (nextType === "rail_group_total") {
                                        updateCondition(condition.id, {
                                            type: "rail_group_total",
                                            rails: [0, 1].filter((rail) => rail < railCount),
                                            photonCount: 1,
                                        } as Partial<PostSelectionCondition>);
                                    } else {
                                        updateCondition(condition.id, {
                                            type: "rail_group_pattern",
                                            rails: [0, 1].filter((rail) => rail < railCount),
                                            pattern: [1, 0].slice(0, Math.min(2, railCount)),
                                        } as Partial<PostSelectionCondition>);
                                    }
                                }}
                                style={inputStyle}
                            >
                                <option value="rail_equals">Rail equals</option>
                                <option value="rail_group_total">Group total</option>
                                <option value="rail_group_pattern">Group pattern</option>
                            </select>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                                    gap: 8,
                                    alignItems: "end",
                                }}
                            >
                                {condition.type === "rail_equals" && (
                                    <>
                                        <label style={miniLabelStyle}>
                                            Rail
                                            <input
                                                disabled={!config.enabled}
                                                type="number"
                                                min={0}
                                                max={railCount - 1}
                                                step={1}
                                                value={condition.rail}
                                                onChange={(event) =>
                                                    updateCondition(condition.id, {
                                                        rail: Math.min(
                                                            railCount - 1,
                                                            Math.max(0, Math.floor(Number(event.target.value)))
                                                        ),
                                                    })
                                                }
                                                style={inputStyle}
                                            />
                                        </label>

                                        <label style={miniLabelStyle}>
                                            Photon count
                                            <input
                                                disabled={!config.enabled}
                                                type="number"
                                                min={0}
                                                step={1}
                                                value={condition.photonCount}
                                                onChange={(event) =>
                                                    updateCondition(condition.id, {
                                                        photonCount: Math.max(
                                                            0,
                                                            Math.floor(Number(event.target.value))
                                                        ),
                                                    })
                                                }
                                                style={inputStyle}
                                            />
                                        </label>
                                    </>
                                )}

                                {condition.type === "rail_group_total" && (
                                    <>
                                        <label style={miniLabelStyle}>
                                            Rails, comma-separated
                                            <input
                                                disabled={!config.enabled}
                                                type="text"
                                                value={condition.rails.join(",")}
                                                onChange={(event) =>
                                                    updateCondition(condition.id, {
                                                        rails: parseRailList(event.target.value).filter(
                                                            (rail) => rail < railCount
                                                        ),
                                                    })
                                                }
                                                style={inputStyle}
                                            />
                                        </label>

                                        <label style={miniLabelStyle}>
                                            Total photons
                                            <input
                                                disabled={!config.enabled}
                                                type="number"
                                                min={0}
                                                step={1}
                                                value={condition.photonCount}
                                                onChange={(event) =>
                                                    updateCondition(condition.id, {
                                                        photonCount: Math.max(
                                                            0,
                                                            Math.floor(Number(event.target.value))
                                                        ),
                                                    })
                                                }
                                                style={inputStyle}
                                            />
                                        </label>
                                    </>
                                )}

                                {condition.type === "rail_group_pattern" && (
                                    <>
                                        <label style={miniLabelStyle}>
                                            Rails, comma-separated
                                            <input
                                                disabled={!config.enabled}
                                                type="text"
                                                value={condition.rails.join(",")}
                                                onChange={(event) => {
                                                    const rails = parseRailList(event.target.value).filter(
                                                        (rail) => rail < railCount
                                                    );

                                                    updateCondition(condition.id, {
                                                        rails,
                                                        pattern: condition.pattern.slice(0, rails.length),
                                                    });
                                                }}
                                                style={inputStyle}
                                            />
                                        </label>

                                        <label style={miniLabelStyle}>
                                            Pattern, comma-separated
                                            <input
                                                disabled={!config.enabled}
                                                type="text"
                                                value={condition.pattern.join(",")}
                                                onChange={(event) =>
                                                    updateCondition(condition.id, {
                                                        pattern: parsePattern(event.target.value),
                                                    })
                                                }
                                                style={inputStyle}
                                            />
                                        </label>
                                    </>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => removeCondition(condition.id)}
                                disabled={!config.enabled}
                                style={{
                                    padding: "7px 10px",
                                    borderRadius: 10,
                                    border: "1px solid #fecaca",
                                    background: "#ffffff",
                                    color: "#991b1b",
                                    fontSize: 12,
                                    fontWeight: 800,
                                    cursor: config.enabled ? "pointer" : "not-allowed",
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 14,
                    flexWrap: "wrap",
                    marginTop: 12,
                    fontSize: 13,
                    color: "#334155",
                }}
            >
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <input
                        type="checkbox"
                        checked={config.hideMeasuredRails}
                        disabled={!config.enabled}
                        onChange={(event) => setHideMeasuredRails(event.target.checked)}
                    />
                    Hide measured rails
                </label>

                <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <input
                        type="checkbox"
                        checked={config.renormalise}
                        disabled={!config.enabled}
                        onChange={(event) => setRenormalise(event.target.checked)}
                    />
                    Renormalise successful outputs
                </label>
            </div>

            {config.enabled && config.conditions.length > 0 && (
                <div
                    style={{
                        marginTop: 12,
                        padding: 10,
                        borderRadius: 10,
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        fontSize: 13,
                        color: "#334155",
                        lineHeight: 1.5,
                    }}
                >
                    <strong>Success probability:</strong>{" "}
                    {successProbability.toFixed(6)}
                    <br />
                    <strong>Successful outcomes:</strong> {successfulOutcomeCount} /{" "}
                    {totalOutcomeCount}
                    <br />
                    <strong>Conditions:</strong>{" "}
                    {config.conditions.map(conditionSummary).join(" AND ")}
                </div>
            )}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "7px 8px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    fontSize: 13,
    color: "#0f172a",
    fontWeight: 700,
    boxSizing: "border-box",
};

const miniLabelStyle: React.CSSProperties = {
    display: "grid",
    gap: 4,
    fontSize: 11,
    fontWeight: 800,
    color: "#475569",
};

const OutputDistributionChart: React.FC = () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [autoSelectedKey, setAutoSelectedKey] = useState<string | null>(null);

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
    const setSweepOccupations = useExperimentStore(
        (state) => state.setSweepOccupations
    );

    const exactStates: IntermediateState[] = results?.intermediateStates ?? [];
    const sampledStates: SampledIntermediateState[] =
        results?.sampledIntermediateStates ?? [];

    const hasSampledData = sampledStates.length > 0;
    const effectiveMode: InspectorMode =
        inspectorMode === "sampled" && hasSampledData ? "sampled" : "exact";

    const currentExactState = findStateForSelectedColumn(exactStates, selectedStep);
    const currentSampledState = findStateForSelectedColumn(
        sampledStates,
        selectedStep
    );

    const theorySweepStep = findStateForSelectedColumn(
        results?.overlapSweep?.steps ?? [],
        selectedStep
    );

    const sampledSweepStep = findStateForSelectedColumn(
        results?.sampledOverlapSweep?.steps ?? [],
        selectedStep
    );

    const railCount = useExperimentStore((state) => state.railCount);

    const postSelection = useExperimentStore((state) => state.postSelection);

    const setPostSelectionEnabled = useExperimentStore(
        (state) => state.setPostSelectionEnabled
    );

    const addPostSelectionCondition = useExperimentStore(
        (state) => state.addPostSelectionCondition
    );

    const updatePostSelectionCondition = useExperimentStore(
        (state) => state.updatePostSelectionCondition
    );

    const removePostSelectionCondition = useExperimentStore(
        (state) => state.removePostSelectionCondition
    );

    const setPostSelectionHideMeasuredRails = useExperimentStore(
        (state) => state.setPostSelectionHideMeasuredRails
    );

    const setPostSelectionRenormalise = useExperimentStore(
        (state) => state.setPostSelectionRenormalise
    );

    const clearPostSelectionConditions = useExperimentStore(
        (state) => state.clearPostSelectionConditions
    );




    const chartData = useMemo(() => {
        if (!results) return [];

        if (effectiveMode === "sampled") {
            return sampledSweepStep
                ? sweepStepToChartData(sampledSweepStep, selectedOverlap)
                : sampledStateToChartData(currentSampledState);
        }

        return theorySweepStep
            ? sweepStepToChartData(theorySweepStep, selectedOverlap)
            : exactStateToChartData(currentExactState);
    }, [
        results,
        effectiveMode,
        sampledSweepStep,
        theorySweepStep,
        selectedOverlap,
        currentSampledState,
        currentExactState,
    ]);

    const postSelected = useMemo(() => {
        return applyPostSelection(chartData, postSelection);
    }, [chartData, postSelection]);

    const displayedChartData = postSelected.data;



    const sortedChartData = useMemo(() => {
        return [...displayedChartData].sort((a, b) => b.value - a.value);
    }, [displayedChartData]);

    const totalPages = Math.max(
        1,
        Math.ceil(sortedChartData.length / OUTCOMES_PER_PAGE)
    );

    const safePageIndex = Math.min(pageIndex, totalPages - 1);

    const visibleChartData = sortedChartData.slice(
        safePageIndex * OUTCOMES_PER_PAGE,
        safePageIndex * OUTCOMES_PER_PAGE + OUTCOMES_PER_PAGE
    );

    const postSelectionRemovedAllOutcomes =
        postSelection.enabled &&
        postSelection.conditions.length > 0 &&
        chartData.length > 0 &&
        sortedChartData.length === 0;

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

    const autoSelectionKey = `${effectiveMode}-${selectedStep}-${results ? "has-results" : "no-results"}`;

    useEffect(() => {
        setPageIndex(0);
        setAutoSelectedKey(null);
    }, [selectedStep, effectiveMode, results]);

    useEffect(() => {
        if (!results || autoSelectedKey === autoSelectionKey) return;

        const topOccupations = sortedChartData
            .slice(0, AUTO_SELECTED_SWEEP_COUNT)
            .map((entry) => entry.occupation);

        if (topOccupations.length > 0) {
            setSweepOccupations(topOccupations);
            setAutoSelectedKey(autoSelectionKey);
        }
    }, [
        results,
        sortedChartData,
        setSweepOccupations,
        autoSelectionKey,
        autoSelectedKey,
    ]);

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
                        View the output distribution for the selected circuit column. Click bars to add
                        states to the photon-overlap graph, or apply post-selection criteria to analyse
                        heralded gates.
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
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 10,
                }}
            >
                <button
                    type="button"
                    onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
                    disabled={safePageIndex === 0}
                    style={carouselButtonStyle(safePageIndex === 0)}
                >
                    ← Previous
                </button>

                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#475569",
                        textAlign: "center",
                    }}
                >
                    Showing outcomes {safePageIndex * OUTCOMES_PER_PAGE + 1}–
                    {Math.min(
                        (safePageIndex + 1) * OUTCOMES_PER_PAGE,
                        sortedChartData.length
                    )}{" "}
                    of {sortedChartData.length}, ordered by probability
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setPageIndex((current) => Math.min(totalPages - 1, current + 1))
                    }
                    disabled={safePageIndex >= totalPages - 1}
                    style={carouselButtonStyle(safePageIndex >= totalPages - 1)}
                >
                    Next →
                </button>
            </div>





            <div className="export-target">

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
                        minWidth: Math.max(520, visibleChartData.length * 96),
                        padding: "16px 12px 8px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        background: "#f8fafc",
                    }}
                >
                    {visibleChartData.map((entry) => {
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

            </div>


            <PostSelectionControls
                railCount={railCount}
                config={postSelection}
                setEnabled={setPostSelectionEnabled}
                addCondition={addPostSelectionCondition}
                updateCondition={updatePostSelectionCondition}
                removeCondition={removePostSelectionCondition}
                setHideMeasuredRails={setPostSelectionHideMeasuredRails}
                setRenormalise={setPostSelectionRenormalise}
                clearConditions={clearPostSelectionConditions}
                successProbability={postSelected.successProbability}
                successfulOutcomeCount={postSelected.successfulOutcomeCount}
                totalOutcomeCount={postSelected.totalOutcomeCount}
            />


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

function carouselButtonStyle(disabled: boolean): React.CSSProperties {
    return {
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #cbd5e1",
        background: disabled ? "#f1f5f9" : "#ffffff",
        color: disabled ? "#94a3b8" : "#334155",
        fontSize: 13,
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
    };
}

const panelStyle: React.CSSProperties = {
    border: "1px solid #cbd5e1",
    borderRadius: 16,
    background: "#ffffff",
    padding: 16,
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
};

export default OutputDistributionChart;