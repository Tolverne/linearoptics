import type { SimulationRequest } from "@/types/simulation";

export const klmCNOT: SimulationRequest = {
    "railCount": 6,
    "inputState": [
        1,
        0,
        1,
        0,
        0,
        0
    ],
    "components": [
        {
            "id": "ps-h1-pre-88db1ace-5664-4379-ba04-9d0e4e002cfa",
            "type": "phase_shifter",
            "column": 0,
            "rail": 3,
            "params": {
                "phi": -1.5707963267948966
            }
        },
        {
            "id": "bs-h1-da5ff7b0-5116-455f-9729-47fe8f2473d4",
            "type": "beam_splitter",
            "column": 1,
            "rails": [
                2,
                3
            ],
            "params": {
                "theta": 1.5707963267948966
            }
        },
        {
            "id": "ps-h1-post-b74e0fe5-ea77-4906-a6c6-12514d6402ea",
            "type": "phase_shifter",
            "column": 2,
            "rail": 3,
            "params": {
                "phi": -1.5707963267948966
            }
        },
        {
            "id": "sw-c0-dump-bring-66c81161-10f9-4d8a-9ba1-0943579d8b84",
            "type": "swap",
            "column": 3,
            "rails": [
                3,
                4
            ]
        },
        {
            "id": "sw-c0-dump-bring-4bf26e6c-14cb-4831-a6d2-d3330ea364f4",
            "type": "swap",
            "column": 4,
            "rails": [
                2,
                3
            ]
        },
        {
            "id": "sw-c0-dump-bring-337b9d28-b9ef-40fb-9ae8-bd42db8ea6aa",
            "type": "swap",
            "column": 5,
            "rails": [
                1,
                2
            ]
        },
        {
            "id": "bs-c0-dump-6070bb83-2b28-4009-bcd0-3f883cbaa0c8",
            "type": "beam_splitter",
            "column": 6,
            "rails": [
                0,
                1
            ],
            "params": {
                "theta": 1.9106332362490184
            }
        },
        {
            "id": "sw-c0-dump-restore-e04a99f7-aec2-40e6-ba8b-50c5bd3c5d24",
            "type": "swap",
            "column": 7,
            "rails": [
                1,
                2
            ]
        },
        {
            "id": "sw-c0-dump-restore-dd1d951c-deee-49c3-8381-d2662e21e7c5",
            "type": "swap",
            "column": 8,
            "rails": [
                2,
                3
            ]
        },
        {
            "id": "sw-c0-dump-restore-f3d1cdb3-bac1-4345-ba4b-c33ad109ed9a",
            "type": "swap",
            "column": 9,
            "rails": [
                3,
                4
            ]
        },
        {
            "id": "sw-c1-t1-bring-4892e244-2aff-488b-b5b3-f2af5099d1ea",
            "type": "swap",
            "column": 10,
            "rails": [
                2,
                3
            ]
        },
        {
            "id": "bs-c1-t1-9f2a490d-b9cd-471c-8818-36d5bb14c61e",
            "type": "beam_splitter",
            "column": 11,
            "rails": [
                1,
                2
            ],
            "params": {
                "theta": 1.9106332362490184
            }
        },
        {
            "id": "sw-c1-t1-restore-e178886f-8a1b-413e-b2eb-b2fbaf963bcf",
            "type": "swap",
            "column": 12,
            "rails": [
                2,
                3
            ]
        },
        {
            "id": "sw-t0-dump-bring-1dc1f320-f4f3-458d-a616-f7286db52d6d",
            "type": "swap",
            "column": 13,
            "rails": [
                4,
                5
            ]
        },
        {
            "id": "sw-t0-dump-bring-df1aaf02-82a2-4873-ae3d-6bca531cb33d",
            "type": "swap",
            "column": 14,
            "rails": [
                3,
                4
            ]
        },
        {
            "id": "bs-t0-dump-657f309d-5edf-4550-adca-3a20c5f5eb4d",
            "type": "beam_splitter",
            "column": 15,
            "rails": [
                2,
                3
            ],
            "params": {
                "theta": 1.9106332362490184
            }
        },
        {
            "id": "sw-t0-dump-restore-9a25e656-e7b3-4a89-a1fc-6e0cc62d92df",
            "type": "swap",
            "column": 16,
            "rails": [
                3,
                4
            ]
        },
        {
            "id": "sw-t0-dump-restore-ab0c2809-5afb-46aa-99a9-2f1d0ad5f377",
            "type": "swap",
            "column": 17,
            "rails": [
                4,
                5
            ]
        },
        {
            "id": "ps-h2-pre-19c0caa8-a331-46f3-a1cd-0660f4dbdaff",
            "type": "phase_shifter",
            "column": 18,
            "rail": 3,
            "params": {
                "phi": -1.5707963267948966
            }
        },
        {
            "id": "bs-h2-032b815f-1681-403a-8fbe-dea5625314eb",
            "type": "beam_splitter",
            "column": 19,
            "rails": [
                2,
                3
            ],
            "params": {
                "theta": 1.5707963267948966
            }
        },
        {
            "id": "ps-h2-post-4c64e020-7da0-47a1-85ff-59ddd541310c",
            "type": "phase_shifter",
            "column": 20,
            "rail": 3,
            "params": {
                "phi": -1.5707963267948966
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
