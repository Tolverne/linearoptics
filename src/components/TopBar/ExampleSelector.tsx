import React from "react";
import { useExperimentStore } from "@/store/useExperimentStore";
import { homExample } from "@/lib/examples/hom";
import { dualRailSwapExample } from "@/lib/examples/dualRailSwap";
import type { SimulationRequest } from "@/types/simulation";

const singlePhotonExample: SimulationRequest = {
  railCount: 2,
  inputState: [1, 0],
  components: [
    {
      id: "bs-single-1",
      type: "beam_splitter",
      column: 0,
      rails: [0, 1],
      params: {
        theta: Math.PI / 4,
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

function applyExample(example: SimulationRequest) {
  const state = useExperimentStore.getState();

  if ("loadExample" in state && typeof state.loadExample === "function") {
    state.loadExample(example);
    return;
  }

  useExperimentStore.setState({
    railCount: example.railCount,
    inputState: [...example.inputState],
    components: [...example.components],
    overlap: example.distinguishability.overlap,
    shots: example.options.shots,
    includeSamples: example.options.includeSamples,
    includeIntermediateStates: example.options.includeIntermediateStates,
    selectedComponentId: null,
    selectedStep: 0,
    results: null,
    error: null,
  });
}

const ExampleSelector: React.FC = () => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (!value) return;

    if (value === "single-photon-bs") {
      applyExample(singlePhotonExample);
    } else if (value === "hom") {
      applyExample(homExample);
    } else if (value === "dual-rail-swap") {
      applyExample(dualRailSwapExample);
    }

    event.target.value = "";
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <label
        htmlFor="example-selector"
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#334155",
          whiteSpace: "nowrap",
        }}
      >
        Examples
      </label>

      <select
        id="example-selector"
        defaultValue=""
        onChange={handleChange}
        style={{
          minWidth: 220,
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid #cbd5e1",
          background: "#ffffff",
          fontSize: 14,
          color: "#0f172a",
        }}
      >
        <option value="" disabled>
          Load an example...
        </option>
        <option value="single-photon-bs">Single photon + beam splitter</option>
        <option value="hom">Hong–Ou–Mandel</option>
        <option value="dual-rail-swap">Dual-rail swap routing</option>
      </select>
    </div>
  );
};

export default ExampleSelector;