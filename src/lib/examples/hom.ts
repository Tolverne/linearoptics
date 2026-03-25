import type { SimulationRequest } from "@/types/simulation";

export const homExample: SimulationRequest = {
  railCount: 2,
  inputState: [1, 1],
  components: [
    {
      id: "bs-1",
      type: "beam_splitter",
      column: 0,
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
    maxDisplayedBasisStates: 16,
  },
};
