import type { SimulationRequest } from "@/types/simulation";

export const NSexample: SimulationRequest = {
    "railCount": 3,
        "inputState": [
            1,
            1,
            0
        ],
            "components": [
                {
                    "id": "bs-ns-01",
                    "type": "beam_splitter",
                    "column": 0,
                    "rails": [
                        0,
                        1
                    ],
                    "params": {
                        "theta": 4.214476877
                    }
                },
                {
                    "id": "bs-ns-12",
                    "type": "beam_splitter",
                    "column": 1,
                    "rails": [
                        1,
                        2
                    ],
                    "params": {
                        "theta": 5.44871855
                    }
                },
                {
                    "id": "bs-ns-01-final",
                    "type": "beam_splitter",
                    "column": 2,
                    "rails": [
                        0,
                        1
                    ],
                    "params": {
                        "theta": 2.068708557
                    }
                },
                {
                    "id": "ps-ns-signal-pi",
                    "type": "phase_shifter",
                    "column": 3,
                    "rail": 0,
                    "params": {
                        "phi": 3.141592654
                    }
                },
                {
                    "id": "ps-ns-ancilla-one",
                    "type": "phase_shifter",
                    "column": 3,
                    "rail": 1,
                    "params": {
                        "phi": 0.599375457
                    }
                },
                {
                    "id": "ps-ns-ancilla-zero",
                    "type": "phase_shifter",
                    "column": 3,
                    "rail": 2,
                    "params": {
                        "phi": 4.10052477
                    }
                }
            ],
    distinguishability: {
        model: "global_overlap",
        overlap: 1,
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
