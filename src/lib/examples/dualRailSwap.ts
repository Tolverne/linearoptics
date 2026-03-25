import type { SimulationRequest } from "@/types/simulation";

export const dualRailSwapExample: SimulationRequest = {
  railCount: 4,
  inputState: [1, 0, 1, 0],
  components: [
    {
      id: "sw-1",
      type: "swap",
      column: 0,
      rails: [1, 2],
    },
    {
      id: "bs-1",
      type: "beam_splitter",
      column: 1,
      rails: [0, 1],
      params: {
        theta: Math.PI / 2,
      },
    },
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
  },
};
