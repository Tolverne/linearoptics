import { create } from "zustand";
import type {
  CircuitComponent,
  SimulationRequest,
  SimulationResponse,
} from "@/types/simulation";

type InspectorMode = "exact" | "sampled";

type ExperimentStore = {
  railCount: number;
  inputState: number[];
  components: CircuitComponent[];
  overlap: number;
  shots: number;
  includeIntermediateStates: boolean;
  includeSamples: boolean;

  selectedComponentId: string | null;
  selectedStep: number;
  inspectorMode: InspectorMode;
  results: SimulationResponse | null;

  isRunning: boolean;
  error: string | null;

  setRailCount: (railCount: number) => void;
  setInputPhoton: (rail: number, value: number) => void;
  setOverlap: (overlap: number) => void;
  setShots: (shots: number) => void;
  setIncludeSamples: (includeSamples: boolean) => void;
  setIncludeIntermediateStates: (
    includeIntermediateStates: boolean
  ) => void;

  addComponent: (component: CircuitComponent) => void;
  updateComponent: (id: string, patch: Partial<CircuitComponent>) => void;
  removeComponent: (id: string) => void;

  setSelectedComponentId: (id: string | null) => void;
  setSelectedStep: (step: number) => void;
  setInspectorMode: (mode: InspectorMode) => void;

  setResults: (results: SimulationResponse | null) => void;
  setError: (error: string | null) => void;
  setIsRunning: (isRunning: boolean) => void;

  clearCircuit: () => void;
  resetAll: () => void;
  loadExample: (example: SimulationRequest) => void;
};

const DEFAULT_RAIL_COUNT = 4;

function makeDefaultInputState(railCount: number): number[] {
  const state = Array.from({ length: railCount }, () => 0);

  if (railCount >= 1) state[0] = 1;
  if (railCount >= 2) state[1] = 1;

  return state;
}

function normaliseInputState(inputState: number[], railCount: number): number[] {
  const next = inputState.slice(0, railCount);

  while (next.length < railCount) {
    next.push(0);
  }

  return next.map((value) => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.floor(value));
  });
}

function defaultState() {
  return {
    railCount: DEFAULT_RAIL_COUNT,
    inputState: makeDefaultInputState(DEFAULT_RAIL_COUNT),
    components: [] as CircuitComponent[],
    overlap: 1,
    shots: 1000,
    includeIntermediateStates: true,
    includeSamples: true,

    selectedComponentId: null,
    selectedStep: 0,
    inspectorMode: "exact" as const,
    results: null,

    isRunning: false,
    error: null,
  };
}

export const useExperimentStore = create<ExperimentStore>((set) => ({
  ...defaultState(),

  setRailCount: (railCount: number) =>
    set((state) => {
      const clampedRailCount = Math.min(6, Math.max(2, Math.floor(railCount)));

      const nextInputState = normaliseInputState(
        state.inputState,
        clampedRailCount
      );

      const filteredComponents = state.components.filter((component) => {
        if ("rail" in component) {
          return component.rail >= 0 && component.rail < clampedRailCount;
        }

        return component.rails.every(
          (rail) => rail >= 0 && rail < clampedRailCount
        );
      });

      const selectedStillExists = filteredComponents.some(
        (component) => component.id === state.selectedComponentId
      );

      return {
        railCount: clampedRailCount,
        inputState: nextInputState,
        components: filteredComponents,
        selectedComponentId: selectedStillExists
          ? state.selectedComponentId
          : null,
        results: null,
        selectedStep: 0,
        error: null,
      };
    }),

  setInputPhoton: (rail: number, value: number) =>
    set((state) => {
      if (rail < 0 || rail >= state.railCount) {
        return {};
      }

      const nextInputState = [...state.inputState];
      nextInputState[rail] = Math.max(0, Math.floor(value));

      return {
        inputState: nextInputState,
        results: null,
        selectedStep: 0,
        error: null,
      };
    }),

  setOverlap: (overlap: number) =>
    set({
      overlap: Math.min(1, Math.max(0, overlap)),
      results: null,
      selectedStep: 0,
      error: null,
    }),

  setShots: (shots: number) =>
    set({
      shots: Math.max(1, Math.floor(shots)),
      results: null,
      selectedStep: 0,
      error: null,
    }),

  setIncludeSamples: (includeSamples: boolean) =>
    set((state) => ({
      includeSamples,
      results: null,
      selectedStep: 0,
      error: null,
      inspectorMode:
        !includeSamples && state.inspectorMode === "sampled"
          ? "exact"
          : state.inspectorMode,
    })),

  setIncludeIntermediateStates: (includeIntermediateStates: boolean) =>
    set({
      includeIntermediateStates,
      results: null,
      selectedStep: 0,
      error: null,
    }),

  addComponent: (component: CircuitComponent) =>
    set((state) => ({
      components: [...state.components, component],
      selectedComponentId: component.id,
      results: null,
      selectedStep: 0,
      error: null,
    })),

  updateComponent: (id: string, patch: Partial<CircuitComponent>) =>
    set((state) => {
      const nextComponents = state.components.map((component) => {
        if (component.id !== id) return component;

        return {
          ...component,
          ...patch,
        } as CircuitComponent;
      });

      return {
        components: nextComponents,
        results: null,
        selectedStep: 0,
        error: null,
      };
    }),

  removeComponent: (id: string) =>
    set((state) => ({
      components: state.components.filter((component) => component.id !== id),
      selectedComponentId:
        state.selectedComponentId === id ? null : state.selectedComponentId,
      results: null,
      selectedStep: 0,
      error: null,
    })),

  setSelectedComponentId: (id: string | null) =>
    set({
      selectedComponentId: id,
    }),

  setSelectedStep: (step: number) =>
    set({
      selectedStep: Math.max(0, Math.floor(step)),
    }),

  setInspectorMode: (mode: InspectorMode) =>
    set({
      inspectorMode: mode,
    }),

  setResults: (results: SimulationResponse | null) =>
    set((state) => ({
      results,
      selectedStep: 0,
      inspectorMode:
        state.inspectorMode === "sampled" &&
        (!results?.sampledIntermediateStates ||
          results.sampledIntermediateStates.length === 0)
          ? "exact"
          : state.inspectorMode,
    })),

  setError: (error: string | null) =>
    set({
      error,
    }),

  setIsRunning: (isRunning: boolean) =>
    set({
      isRunning,
    }),

  clearCircuit: () =>
    set({
      components: [],
      selectedComponentId: null,
      selectedStep: 0,
      results: null,
      error: null,
    }),

  resetAll: () =>
    set({
      ...defaultState(),
    }),

  loadExample: (example: SimulationRequest) =>
    set({
      railCount: example.railCount,
      inputState: normaliseInputState(example.inputState, example.railCount),
      components: [...example.components],
      overlap: example.distinguishability.overlap,
      shots: example.options.shots,
      includeIntermediateStates: example.options.includeIntermediateStates,
      includeSamples: example.options.includeSamples,
      selectedComponentId: null,
      selectedStep: 0,
      inspectorMode: "exact",
      results: null,
      isRunning: false,
      error: null,
    }),
}));