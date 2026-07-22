import React from "react";
import type { PhaseShifterComponent } from "@/types/simulation";
import { useExperimentStore } from "@/store/useExperimentStore";
import { formatNiceNumber } from "@/utils/formatNumber";

type PhaseShifterNodeProps = {
    component: PhaseShifterComponent;
    rowHeight?: number;
    columnWidth?: number;
    isSelected?: boolean;
    onSelect?: () => void;
    onDragStart?: (event: React.DragEvent<HTMLButtonElement>) => void;
};

const PhaseShifterNode: React.FC<PhaseShifterNodeProps> = ({
    component,
    rowHeight = 72,
    columnWidth = 96,
    isSelected = false,
    onSelect,
    onDragStart,
}) => {
    const mode = useExperimentStore((state) => state.numericDisplayMode);

    const phiLabel = formatNiceNumber(component.params.phi, {
        mode,
        decimalPlaces: 3,
    });

    return (
        <button
            type="button"
            onClick={onSelect}
            onMouseDown={onSelect}
            draggable
            onDragStart={onDragStart}
            title={`Phase shifter (φ = ${phiLabel})`}
            style={{
                position: "absolute",
                left: component.column * columnWidth + columnWidth * 0.18,
                top: component.rail * rowHeight + rowHeight * 0.08,
                width: columnWidth * 0.64,
                height: rowHeight * 0.84,
                borderRadius: 16,
                border: isSelected
                    ? "1px solid rgba(167, 139, 250, 0.78)"
                    : "1px solid rgba(167, 139, 250, 0.38)",
                background: isSelected
                    ? "linear-gradient(180deg, rgba(167, 139, 250, 0.24), rgba(88, 28, 135, 0.2))"
                    : "linear-gradient(180deg, rgba(167, 139, 250, 0.14), rgba(7, 11, 20, 0.72))",
                boxShadow: isSelected
                    ? "0 0 22px rgba(167, 139, 250, 0.48), inset 0 0 20px rgba(167, 139, 250, 0.12)"
                    : "0 0 12px rgba(167, 139, 250, 0.18), inset 0 0 14px rgba(167, 139, 250, 0.08)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 4,
                boxSizing: "border-box",
                color: "var(--qopt-text)",
                overflow: "hidden",
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 3,
                    borderRadius: 13,
                    border: "1px solid rgba(229, 238, 248, 0.08)",
                    pointerEvents: "none",
                }}
            />

            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: -18,
                    left: "50%",
                    width: 42,
                    height: 42,
                    transform: "translateX(-50%)",
                    borderRadius: 999,
                    background: "rgba(167, 139, 250, 0.22)",
                    filter: "blur(16px)",
                    pointerEvents: "none",
                }}
            />

            {isSelected && (
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: -2,
                        borderRadius: 18,
                        border: "1px solid rgba(224, 231, 255, 0.3)",
                        pointerEvents: "none",
                    }}
                />
            )}

            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 2,
                    background: isSelected
                        ? "rgba(224, 231, 255, 0.18)"
                        : "rgba(167, 139, 250, 0.14)",
                    border: "1px solid rgba(167, 139, 250, 0.4)",
                    boxShadow: isSelected
                        ? "0 0 16px rgba(167, 139, 250, 0.5)"
                        : "0 0 10px rgba(167, 139, 250, 0.22)",
                }}
            >
                <span
                    style={{
                        fontSize: 17,
                        fontWeight: 900,
                        color: isSelected ? "#f5f3ff" : "#ddd6fe",
                        lineHeight: 1,
                    }}
                >
                    φ
                </span>
            </div>

            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    maxWidth: "100%",
                    padding: "3px 7px",
                    borderRadius: 999,
                    background: "rgba(7, 11, 20, 0.72)",
                    border: "1px solid rgba(167, 139, 250, 0.3)",
                    fontSize: 10.5,
                    fontWeight: 900,
                    color: isSelected ? "#f5f3ff" : "#ddd6fe",
                    lineHeight: 1.25,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
                {phiLabel}
            </div>

            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    bottom: 3,
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: "#a78bfa",
                    boxShadow: "0 0 12px rgba(167, 139, 250, 0.85)",
                    opacity: isSelected ? 1 : 0.75,
                }}
            />
        </button>
    );
};

export default PhaseShifterNode;