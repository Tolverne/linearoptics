import React from "react";
import { useExperimentStore } from "@/store/useExperimentStore";
import type { PostSelectionCondition } from "@/types/simulation";

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

function conditionSummary(condition: PostSelectionCondition): string {
    if (condition.type === "rail_equals") {
        return `Accept if rail ${condition.rail} contains ${condition.photonCount} photon(s).`;
    }

    if (condition.type === "rail_group_total") {
        return `Accept if rails [${condition.rails.join(", ")}] contain ${condition.photonCount
            } photon(s) in total.`;
    }

    return `Accept if rails [${condition.rails.join(", ")}] match pattern [${condition.pattern.join(
        ", "
    )}].`;
}

function conditionLabel(condition: PostSelectionCondition): string {
    if (condition.type === "rail_equals") return "Rail equals";
    if (condition.type === "rail_group_total") return "Group total";
    return "Group pattern";
}

const titleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 800,
    color: "var(--qopt-text)",
    marginBottom: 4,
};

const descriptionStyle: React.CSSProperties = {
    fontSize: 13,
    color: "var(--qopt-muted)",
    lineHeight: 1.5,
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--qopt-border)",
    background: "rgba(7, 11, 20, 0.62)",
    fontSize: 13,
    color: "var(--qopt-text)",
    fontWeight: 700,
    boxSizing: "border-box",
};

const miniLabelStyle: React.CSSProperties = {
    display: "grid",
    gap: 5,
    fontSize: 11,
    fontWeight: 800,
    color: "var(--qopt-muted)",
    textTransform: "uppercase",
    letterSpacing: 0.65,
};

const buttonStyle: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--qopt-border)",
    background: "rgba(23, 32, 51, 0.72)",
    color: "var(--qopt-text)",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
};

const addButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    border: "1px solid rgba(34, 211, 238, 0.32)",
    background: "rgba(34, 211, 238, 0.08)",
};

const clearButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    width: "100%",
    border: "1px solid rgba(251, 113, 133, 0.3)",
    background: "rgba(251, 113, 133, 0.09)",
    color: "#ffe4e6",
};

const removeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    border: "1px solid rgba(251, 113, 133, 0.34)",
    background: "rgba(251, 113, 133, 0.1)",
    color: "#ffe4e6",
};

const emptyStateStyle: React.CSSProperties = {
    fontSize: 13,
    color: "var(--qopt-muted)",
    lineHeight: 1.5,
    padding: 12,
    borderRadius: 14,
    border: "1px dashed rgba(148, 163, 184, 0.3)",
    background: "rgba(7, 11, 20, 0.26)",
};

const conditionCardStyle: React.CSSProperties = {
    display: "grid",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    border: "1px solid var(--qopt-border)",
    background:
        "linear-gradient(180deg, rgba(23, 32, 51, 0.72), rgba(7, 11, 20, 0.46))",
};

const summaryStyle: React.CSSProperties = {
    fontSize: 12,
    color: "var(--qopt-muted)",
    lineHeight: 1.45,
    padding: "8px 10px",
    borderRadius: 10,
    background: "rgba(7, 11, 20, 0.42)",
    border: "1px solid rgba(148, 163, 184, 0.14)",
};

const checkboxLabelStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 800,
    color: "var(--qopt-text)",
};

const PostSelectionPanel: React.FC = () => {
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

    const setPostSelectionRenormalise = useExperimentStore(
        (state) => state.setPostSelectionRenormalise
    );

    const clearPostSelectionConditions = useExperimentStore(
        (state) => state.clearPostSelectionConditions
    );

    function addRailEquals() {
        addPostSelectionCondition({
            id: makeId("ps"),
            type: "rail_equals",
            rail: 0,
            photonCount: 1,
        });
    }

    function addGroupTotal() {
        addPostSelectionCondition({
            id: makeId("ps"),
            type: "rail_group_total",
            rails: [0, 1].filter((rail) => rail < railCount),
            photonCount: 1,
        });
    }

    function addGroupPattern() {
        addPostSelectionCondition({
            id: makeId("ps"),
            type: "rail_group_pattern",
            rails: [0, 1].filter((rail) => rail < railCount),
            pattern: [1, 0].slice(0, Math.min(2, railCount)),
        });
    }

    function addDualRailValid() {
        addPostSelectionCondition({
            id: makeId("ps"),
            type: "rail_group_total",
            rails: [0, 1].filter((rail) => rail < railCount),
            photonCount: 1,
        });
    }

    return (
        <div
            style={{
                display: "grid",
                gap: 12,
            }}
        >
            <div>
                <div style={titleStyle}>Post-selection</div>

                <div style={descriptionStyle}>
                    Filter accepted output states using heralding, measured rails, or
                    logical-subspace conditions.
                </div>
            </div>

            <div
                style={{
                    border: postSelection.enabled
                        ? "1px solid rgba(34, 211, 238, 0.36)"
                        : "1px solid var(--qopt-border)",
                    borderRadius: 14,
                    background: postSelection.enabled
                        ? "rgba(34, 211, 238, 0.08)"
                        : "rgba(7, 11, 20, 0.28)",
                    padding: 12,
                    display: "grid",
                    gap: 10,
                }}
            >
                <label style={checkboxLabelStyle}>
                    <input
                        type="checkbox"
                        checked={postSelection.enabled}
                        onChange={(event) => setPostSelectionEnabled(event.target.checked)}
                    />
                    Enable post-selection
                </label>

                <div
                    style={{
                        fontSize: 12,
                        color: "var(--qopt-muted)",
                        lineHeight: 1.4,
                    }}
                >
                    Conditions are combined with AND. Only output states satisfying every
                    condition are accepted.
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                }}
            >
                <button type="button" onClick={addRailEquals} style={addButtonStyle}>
                    + Rail equals
                </button>

                <button type="button" onClick={addGroupTotal} style={addButtonStyle}>
                    + Group total
                </button>

                <button type="button" onClick={addGroupPattern} style={addButtonStyle}>
                    + Pattern
                </button>

                <button type="button" onClick={addDualRailValid} style={addButtonStyle}>
                    + Dual rail
                </button>
            </div>

            <button
                type="button"
                onClick={clearPostSelectionConditions}
                style={clearButtonStyle}
            >
                Clear conditions
            </button>

            <div
                style={{
                    display: "grid",
                    gap: 10,
                    opacity: postSelection.enabled ? 1 : 0.55,
                }}
            >
                {postSelection.conditions.length === 0 ? (
                    <div style={emptyStateStyle}>
                        Add one or more accepted-output conditions. For example, use a group
                        total condition to accept only the logical dual-rail subspace.
                    </div>
                ) : (
                    postSelection.conditions.map((condition, index) => (
                        <div key={condition.id} style={conditionCardStyle}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 10,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        minWidth: 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: 999,
                                            background: "var(--qopt-cyan)",
                                            boxShadow: "0 0 14px rgba(34, 211, 238, 0.7)",
                                            flexShrink: 0,
                                        }}
                                    />

                                    <div
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 900,
                                            color: "var(--qopt-text)",
                                        }}
                                    >
                                        Condition {index + 1}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 800,
                                        color: "var(--qopt-cyan)",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.7,
                                    }}
                                >
                                    {conditionLabel(condition)}
                                </div>
                            </div>

                            <select
                                disabled={!postSelection.enabled}
                                value={condition.type}
                                onChange={(event) => {
                                    const nextType = event.target
                                        .value as PostSelectionCondition["type"];

                                    if (nextType === "rail_equals") {
                                        updatePostSelectionCondition(condition.id, {
                                            type: "rail_equals",
                                            rail: 0,
                                            photonCount: 1,
                                        } as Partial<PostSelectionCondition>);
                                    } else if (nextType === "rail_group_total") {
                                        updatePostSelectionCondition(condition.id, {
                                            type: "rail_group_total",
                                            rails: [0, 1].filter((rail) => rail < railCount),
                                            photonCount: 1,
                                        } as Partial<PostSelectionCondition>);
                                    } else {
                                        updatePostSelectionCondition(condition.id, {
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

                            {condition.type === "rail_equals" && (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: 8,
                                    }}
                                >
                                    <label style={miniLabelStyle}>
                                        Rail
                                        <input
                                            disabled={!postSelection.enabled}
                                            type="number"
                                            min={0}
                                            max={railCount - 1}
                                            step={1}
                                            value={condition.rail}
                                            onChange={(event) =>
                                                updatePostSelectionCondition(condition.id, {
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
                                        Count
                                        <input
                                            disabled={!postSelection.enabled}
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={condition.photonCount}
                                            onChange={(event) =>
                                                updatePostSelectionCondition(condition.id, {
                                                    photonCount: Math.max(
                                                        0,
                                                        Math.floor(Number(event.target.value))
                                                    ),
                                                })
                                            }
                                            style={inputStyle}
                                        />
                                    </label>
                                </div>
                            )}

                            {condition.type === "rail_group_total" && (
                                <div style={{ display: "grid", gap: 8 }}>
                                    <label style={miniLabelStyle}>
                                        Rails, comma-separated
                                        <input
                                            disabled={!postSelection.enabled}
                                            type="text"
                                            value={condition.rails.join(",")}
                                            onChange={(event) =>
                                                updatePostSelectionCondition(condition.id, {
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
                                            disabled={!postSelection.enabled}
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={condition.photonCount}
                                            onChange={(event) =>
                                                updatePostSelectionCondition(condition.id, {
                                                    photonCount: Math.max(
                                                        0,
                                                        Math.floor(Number(event.target.value))
                                                    ),
                                                })
                                            }
                                            style={inputStyle}
                                        />
                                    </label>
                                </div>
                            )}

                            {condition.type === "rail_group_pattern" && (
                                <div style={{ display: "grid", gap: 8 }}>
                                    <label style={miniLabelStyle}>
                                        Rails, comma-separated
                                        <input
                                            disabled={!postSelection.enabled}
                                            type="text"
                                            value={condition.rails.join(",")}
                                            onChange={(event) => {
                                                const rails = parseRailList(event.target.value).filter(
                                                    (rail) => rail < railCount
                                                );

                                                updatePostSelectionCondition(condition.id, {
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
                                            disabled={!postSelection.enabled}
                                            type="text"
                                            value={condition.pattern.join(",")}
                                            onChange={(event) =>
                                                updatePostSelectionCondition(condition.id, {
                                                    pattern: parsePattern(event.target.value),
                                                })
                                            }
                                            style={inputStyle}
                                        />
                                    </label>
                                </div>
                            )}

                            <div style={summaryStyle}>{conditionSummary(condition)}</div>

                            <button
                                type="button"
                                onClick={() => removePostSelectionCondition(condition.id)}
                                disabled={!postSelection.enabled}
                                style={{
                                    ...removeButtonStyle,
                                    opacity: postSelection.enabled ? 1 : 0.55,
                                    cursor: postSelection.enabled ? "pointer" : "not-allowed",
                                }}
                            >
                                Remove condition
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div
                style={{
                    display: "grid",
                    gap: 8,
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid var(--qopt-border)",
                    background: "rgba(7, 11, 20, 0.3)",
                    fontSize: 13,
                    color: "var(--qopt-text)",
                }}
            >
                <label style={checkboxLabelStyle}>
                    <input
                        type="checkbox"
                        checked={postSelection.renormalise}
                        disabled={!postSelection.enabled}
                        onChange={(event) =>
                            setPostSelectionRenormalise(event.target.checked)
                        }
                    />
                    Renormalise accepted outputs
                </label>

                <div
                    style={{
                        fontSize: 12,
                        color: "var(--qopt-muted)",
                        lineHeight: 1.4,
                    }}
                >
                    When enabled, accepted probabilities are rescaled to sum to one after
                    filtering.
                </div>
            </div>
        </div>
    );
};

export default PostSelectionPanel;