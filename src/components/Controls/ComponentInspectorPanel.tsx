import React, { useEffect, useState } from "react";
import { useExperimentStore } from "@/store/useExperimentStore";
import { formatNiceNumber } from "@/utils/formatNumber";
import type {
    BeamSplitterComponent,
    CircuitComponent,
    PhaseShifterComponent,
    SwapComponent,
} from "@/types/simulation";

const BASE_DENOMINATORS = [6, 4, 3, 2]; // π/6, π/4, π/3, π/2

function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

function formatPiLabel(n: number, d: number): string {
    if (n === 0) return "0";
    if (n === d) return "π";
    if (n === 2 * d) return "2π";

    const divisor = gcd(n, d);
    const num = n / divisor;
    const den = d / divisor;

    if (num === 1) return `π/${den}`;
    return `${num}π/${den}`;
}

function generateAnglePresets() {
    const map = new Map<number, { label: string; value: number }>();

    map.set(0, { label: "0", value: 0 });
    map.set(Math.PI, { label: "π", value: Math.PI });
    map.set(2 * Math.PI, { label: "2π", value: 2 * Math.PI });

    for (const d of BASE_DENOMINATORS) {
        for (let n = 1; n <= 2 * d; n++) {
            const value = (n * Math.PI) / d;
            const key = Number(value.toFixed(6));

            if (!map.has(key)) {
                map.set(key, {
                    label: formatPiLabel(n, d),
                    value,
                });
            }
        }
    }

    return Array.from(map.values()).sort((a, b) => a.value - b.value);
}

const ANGLE_PRESETS = generateAnglePresets();

function findPresetAngle(value: number): string {
    const match = ANGLE_PRESETS.find(
        (preset) => Math.abs(preset.value - value) < 1e-5
    );

    return match ? String(match.value) : "custom";
}

function normaliseAngleInput(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .replace(/\s/g, "")
        .replace(/π/g, "pi");
}

function parseAngleInput(input: string): number | null {
    const text = normaliseAngleInput(input);

    if (text === "") return null;

    const plainNumber = Number(text);
    if (Number.isFinite(plainNumber)) return plainNumber;

    if (text === "pi") return Math.PI;
    if (text === "-pi") return -Math.PI;

    // Examples:
    // 2pi
    // 0.5pi
    // -3pi
    const simplePiMatch = text.match(/^(-?\d*\.?\d*)pi$/);
    if (simplePiMatch) {
        const coefficientText = simplePiMatch[1];

        const coefficient =
            coefficientText === "" || coefficientText === "+"
                ? 1
                : coefficientText === "-"
                    ? -1
                    : Number(coefficientText);

        if (Number.isFinite(coefficient)) {
            return coefficient * Math.PI;
        }
    }

    // Examples:
    // pi/7
    // 3pi/8
    // -2pi/5
    // 2*pi/5
    const fractionPiMatch = text.match(/^(-?\d*\.?\d*)\*?pi\/(-?\d*\.?\d+)$/);
    if (fractionPiMatch) {
        const numeratorText = fractionPiMatch[1];
        const denominator = Number(fractionPiMatch[2]);

        const numerator =
            numeratorText === "" || numeratorText === "+"
                ? 1
                : numeratorText === "-"
                    ? -1
                    : Number(numeratorText);

        if (
            Number.isFinite(numerator) &&
            Number.isFinite(denominator) &&
            denominator !== 0
        ) {
            return (numerator * Math.PI) / denominator;
        }
    }

    return null;
}

function getSelectedComponent(
    components: CircuitComponent[],
    selectedId: string | null
): CircuitComponent | null {
    if (!selectedId) return null;
    return components.find((component) => component.id === selectedId) ?? null;
}

function getComponentName(component: CircuitComponent): string {
    if (component.type === "beam_splitter") return "Beam splitter";
    if (component.type === "phase_shifter") return "Phase shifter";
    return "Swap";
}

function getComponentAccent(component: CircuitComponent): string {
    if (component.type === "beam_splitter") return "var(--qopt-cyan)";
    if (component.type === "phase_shifter") return "var(--qopt-violet)";
    return "var(--qopt-amber)";
}

function getComponentMeta(component: CircuitComponent): string {
    if (component.type === "beam_splitter") {
        return `Rails ${component.rails[0] + 1} and ${component.rails[1] + 1} · Column ${component.column + 1
            }`;
    }

    if (component.type === "phase_shifter") {
        return `Rail ${component.rail + 1} · Column ${component.column + 1}`;
    }

    return `Rails ${component.rails[0] + 1} and ${component.rails[1] + 1} · Column ${component.column + 1
        }`;
}

const sectionTitleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 800,
    color: "var(--qopt-text)",
    marginBottom: 12,
};

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 800,
    color: "var(--qopt-muted)",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--qopt-border)",
    background: "rgba(7, 11, 20, 0.62)",
    fontSize: 14,
    color: "var(--qopt-text)",
    fontWeight: 650,
    boxSizing: "border-box",
};

const helpTextStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 1.45,
    color: "var(--qopt-subtle)",
};

const errorTextStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 1.45,
    color: "#fecdd3",
};

const infoBoxStyle: React.CSSProperties = {
    padding: 12,
    borderRadius: 14,
    background: "rgba(7, 11, 20, 0.38)",
    border: "1px solid var(--qopt-border)",
    fontSize: 12,
    color: "var(--qopt-muted)",
    lineHeight: 1.5,
};

const emptyStateStyle: React.CSSProperties = {
    ...infoBoxStyle,
    border: "1px dashed rgba(148, 163, 184, 0.3)",
    background: "rgba(7, 11, 20, 0.24)",
};

const selectedCardStyle: React.CSSProperties = {
    marginBottom: 14,
    padding: 12,
    borderRadius: 14,
    background:
        "linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(167, 139, 250, 0.08))",
    border: "1px solid rgba(34, 211, 238, 0.28)",
};

const dangerButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(251, 113, 133, 0.36)",
    background: "rgba(251, 113, 133, 0.12)",
    color: "#ffe4e6",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--qopt-border)",
    background: "rgba(23, 32, 51, 0.72)",
    color: "var(--qopt-text)",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
};

function AngleParameterInput({
    id,
    label,
    value,
    onChange,
}: {
    id: string;
    label: string;
    value: number;
    onChange: (value: number) => void;
}) {
    const [customInput, setCustomInput] = useState(String(Number(value.toFixed(8))));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCustomInput(String(Number(value.toFixed(8))));
        setError(null);
    }, [value]);

    function applyCustomInput(nextInput: string) {
        setCustomInput(nextInput);

        const parsed = parseAngleInput(nextInput);

        if (parsed === null) {
            setError("Enter a number in radians, or use forms like π/4, 3π/8, or 0.25π.");
            return;
        }

        setError(null);
        onChange(parsed);
    }

    return (
        <div style={{ marginBottom: 14 }}>
            <label htmlFor={`${id}-preset`} style={labelStyle}>
                {label}
            </label>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 8,
                }}
            >
                <select
                    id={`${id}-preset`}
                    value={findPresetAngle(value)}
                    onChange={(event) => {
                        if (event.target.value === "custom") return;

                        const nextValue = Number(event.target.value);
                        onChange(nextValue);
                        setCustomInput(String(Number(nextValue.toFixed(8))));
                        setError(null);
                    }}
                    style={inputStyle}
                >
                    {ANGLE_PRESETS.map((preset) => (
                        <option key={preset.label} value={preset.value}>
                            {preset.label} ({preset.value.toFixed(3)})
                        </option>
                    ))}

                    <option value="custom">
                        Custom ({formatNiceNumber(value, { mode: "both" })})
                    </option>
                </select>

                <input
                    id={`${id}-custom`}
                    value={customInput}
                    onChange={(event) => applyCustomInput(event.target.value)}
                    onBlur={(event) => {
                        const parsed = parseAngleInput(event.target.value);

                        if (parsed !== null) {
                            setCustomInput(String(Number(parsed.toFixed(8))));
                        }
                    }}
                    placeholder="Custom value, e.g. 0.123, π/7, 3π/8"
                    spellCheck={false}
                    style={{
                        ...inputStyle,
                        border: error
                            ? "1px solid rgba(251, 113, 133, 0.7)"
                            : inputStyle.border,
                    }}
                />
            </div>

            {error ? (
                <div style={errorTextStyle}>{error}</div>
            ) : (
                <div style={helpTextStyle}>
                    Current value: {formatNiceNumber(value, { mode: "both" })}. You can type
                    radians directly or use π notation.
                </div>
            )}
        </div>
    );
}

function renderBeamSplitterEditor(
    component: BeamSplitterComponent,
    updateComponent: (id: string, patch: Partial<CircuitComponent>) => void
) {
    return (
        <>
            <AngleParameterInput
                id="bs-theta"
                label="θ parameter"
                value={component.params.theta}
                onChange={(theta) =>
                    updateComponent(component.id, {
                        params: {
                            ...component.params,
                            theta,
                        },
                    })
                }
            />

            <div style={infoBoxStyle}>
                Rails {component.rails[0] + 1} and {component.rails[1] + 1}
                <br />
                Column {component.column + 1}
            </div>
        </>
    );
}

function renderPhaseShifterEditor(
    component: PhaseShifterComponent,
    updateComponent: (id: string, patch: Partial<CircuitComponent>) => void
) {
    return (
        <>
            <AngleParameterInput
                id="ps-phi"
                label="φ parameter"
                value={component.params.phi}
                onChange={(phi) =>
                    updateComponent(component.id, {
                        params: {
                            ...component.params,
                            phi,
                        },
                    })
                }
            />

            <div style={infoBoxStyle}>
                Rail {component.rail + 1}
                <br />
                Column {component.column + 1}
            </div>
        </>
    );
}

function renderSwapEditor(component: SwapComponent) {
    return (
        <div style={infoBoxStyle}>
            Swaps rail {component.rails[0] + 1} with rail {component.rails[1] + 1}
            <br />
            Column {component.column + 1}
        </div>
    );
}

const ComponentInspectorPanel: React.FC = () => {
    const components = useExperimentStore((state) => state.components);
    const selectedComponentId = useExperimentStore(
        (state) => state.selectedComponentId
    );
    const updateComponent = useExperimentStore((state) => state.updateComponent);
    const removeComponent = useExperimentStore((state) => state.removeComponent);
    const setSelectedComponentId = useExperimentStore(
        (state) => state.setSelectedComponentId
    );

    const selectedComponent = getSelectedComponent(
        components,
        selectedComponentId
    );

    return (
        <div
            style={{
                display: "grid",
                gap: 12,
            }}
        >
            <div style={sectionTitleStyle}>Component inspector</div>

            {!selectedComponent ? (
                <div style={emptyStateStyle}>
                    Select a component on the circuit grid to inspect or edit its
                    parameters.
                </div>
            ) : (
                <>
                    <div style={selectedCardStyle}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 8,
                            }}
                        >
                            <div
                                style={{
                                    width: 9,
                                    height: 9,
                                    borderRadius: 999,
                                    background: getComponentAccent(selectedComponent),
                                    boxShadow: `0 0 16px ${getComponentAccent(
                                        selectedComponent
                                    )}`,
                                    flexShrink: 0,
                                }}
                            />

                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    color: "var(--qopt-cyan)",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.8,
                                }}
                            >
                                Selected component
                            </div>
                        </div>

                        <div
                            style={{
                                fontSize: 15,
                                fontWeight: 800,
                                color: "var(--qopt-text)",
                            }}
                        >
                            {getComponentName(selectedComponent)}
                        </div>

                        <div
                            style={{
                                marginTop: 5,
                                fontSize: 12,
                                color: "var(--qopt-muted)",
                                lineHeight: 1.4,
                            }}
                        >
                            {getComponentMeta(selectedComponent)}
                        </div>

                        <div
                            style={{
                                marginTop: 6,
                                fontSize: 11,
                                color: "var(--qopt-subtle)",
                                fontFamily:
                                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                overflowWrap: "anywhere",
                            }}
                        >
                            {selectedComponent.id}
                        </div>
                    </div>

                    {selectedComponent.type === "beam_splitter" &&
                        renderBeamSplitterEditor(selectedComponent, updateComponent)}

                    {selectedComponent.type === "phase_shifter" &&
                        renderPhaseShifterEditor(selectedComponent, updateComponent)}

                    {selectedComponent.type === "swap" &&
                        renderSwapEditor(selectedComponent)}

                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            marginTop: 4,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                removeComponent(selectedComponent.id);
                                setSelectedComponentId(null);
                            }}
                            style={dangerButtonStyle}
                        >
                            Delete
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedComponentId(null)}
                            style={secondaryButtonStyle}
                        >
                            Deselect
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ComponentInspectorPanel;