import React, { useRef } from "react";
import { useExperimentStore } from "@/store/useExperimentStore";
import type { CircuitComponent, SimulationRequest } from "@/types/simulation";

type SavedCircuitData = {
    railCount?: number;
    inputState?: number[];
    components?: CircuitComponent[];
    overlap?: number;
    distinguishability?: {
        overlap?: number;
    };
};

function makeLoadedCircuitRequest(saved: SavedCircuitData): SimulationRequest {
    const railCount = Math.min(
        20,
        Math.max(2, Math.floor(Number(saved.railCount ?? 4)))
    );

    const inputState = Array.isArray(saved.inputState)
        ? saved.inputState
            .slice(0, railCount)
            .map((value) => Math.max(0, Math.floor(Number(value) || 0)))
        : Array.from({ length: railCount }, () => 0);

    while (inputState.length < railCount) {
        inputState.push(0);
    }

    const overlap =
        typeof saved.overlap === "number"
            ? saved.overlap
            : typeof saved.distinguishability?.overlap === "number"
                ? saved.distinguishability.overlap
                : 1;

    return {
        railCount,
        inputState,
        components: Array.isArray(saved.components) ? saved.components : [],
        distinguishability: {
            model: "global_overlap",
            overlap: Math.min(1, Math.max(0, overlap)),
        },
        options: {
            includeIntermediateStates: true,
            shots: 1000,
            includeSamples: true,
            maxDisplayedBasisStates: 32,
            overlapSweep: {
                enabled: true,
                minOverlap: 0,
                maxOverlap: 1,
                points: 21,
                returnToStart: true,
            },
        },
    };
}

const LoadCircuitButton: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const loadExample = useExperimentStore((state) => state.loadExample);
    const setError = useExperimentStore((state) => state.setError);

    async function handleFile(file: File) {
        try {
            const text = await file.text();
            const parsed = JSON.parse(text) as SavedCircuitData;
            const request = makeLoadedCircuitRequest(parsed);

            loadExample(request);
            setError(null);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Could not load circuit JSON file.";

            setError(`Could not load circuit JSON file: ${message}`);
        } finally {
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: "none" }}
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                        void handleFile(file);
                    }
                }}
            />

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#334155",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                }}
            >
                Load Circuit
            </button>
        </>
    );
};

export default LoadCircuitButton;