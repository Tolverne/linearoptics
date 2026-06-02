import React from "react";
import { useExperimentStore } from "@/store/useExperimentStore";
import type {
    PostSelectionCondition,
} from "@/types/simulation";

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

const buttonStyle: React.CSSProperties = {
    padding: "7px 10px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
};

const panelStyle: React.CSSProperties = {
    border: "1px solid #cbd5e1",
    borderRadius: 16,
    background: "#ffffff",
    padding: 16,
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
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

    const setPostSelectionHideMeasuredRails = useExperimentStore(
        (state) => state.setPostSelectionHideMeasuredRails
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
        <div style={panelStyle}>
            <div style={{ marginBottom: 12 }}>
                <div
                    style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#0f172a",
                        marginBottom: 4,
                    }}
                >
                    Post-selection
                </div>

                <div
                    style={{
                        fontSize: 13,
                        color: "#475569",
                        lineHeight: 1.5,
                    }}
                >
                    Filter output states using heralding or logical-subspace conditions.
                </div>
            </div>

            <label
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: 12,
                }}
            >
                <input
                    type="checkbox"
                    checked={postSelection.enabled}
                    onChange={(event) => setPostSelectionEnabled(event.target.checked)}
                />
                Enable post-selection
            </label>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 12,
                }}
            >
                <button type="button" onClick={addRailEquals} style={buttonStyle}>
                    + Rail equals
                </button>

                <button type="button" onClick={addGroupTotal} style={buttonStyle}>
                    + Group total
                </button>

                <button type="button" onClick={addGroupPattern} style={buttonStyle}>
                    + Pattern
                </button>

                <button type="button" onClick={addDualRailValid} style={buttonStyle}>
                    + Dual rail
                </button>
            </div>

            <button
                type="button"
                onClick={clearPostSelectionConditions}
                style={{
                    ...buttonStyle,
                    width: "100%",
                    marginBottom: 12,
                }}
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
                    <div
                        style={{
                            fontSize: 13,
                            color: "#64748b",
                            lineHeight: 1.5,
                            padding: 10,
                            borderRadius: 10,
                            border: "1px dashed #cbd5e1",
                            background: "#f8fafc",
                        }}
                    >
                        Add one or more conditions. Conditions are combined with AND.
                    </div>
                ) : (
                    postSelection.conditions.map((condition) => (
                        <div
                            key={condition.id}
                            style={{
                                display: "grid",
                                gap: 8,
                                padding: 10,
                                borderRadius: 12,
                                border: "1px solid #e2e8f0",
                                background: "#f8fafc",
                            }}
                        >
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
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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

                            <div
                                style={{
                                    fontSize: 12,
                                    color: "#475569",
                                    lineHeight: 1.4,
                                }}
                            >
                                {conditionSummary(condition)}
                            </div>

                            <button
                                type="button"
                                onClick={() => removePostSelectionCondition(condition.id)}
                                disabled={!postSelection.enabled}
                                style={{
                                    ...buttonStyle,
                                    border: "1px solid #fecaca",
                                    color: "#991b1b",
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
                    display: "grid",
                    gap: 8,
                    marginTop: 12,
                    fontSize: 13,
                    color: "#334155",
                }}
            >
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <input
                        type="checkbox"
                        checked={postSelection.hideMeasuredRails}
                        disabled={!postSelection.enabled}
                        onChange={(event) =>
                            setPostSelectionHideMeasuredRails(event.target.checked)
                        }
                    />
                    Hide measured rails
                </label>

                <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <input
                        type="checkbox"
                        checked={postSelection.renormalise}
                        disabled={!postSelection.enabled}
                        onChange={(event) =>
                            setPostSelectionRenormalise(event.target.checked)
                        }
                    />
                    Renormalise outputs
                </label>
            </div>
        </div>
    );
};

export default PostSelectionPanel;