export type RailIndex = number;
export type ColumnIndex = number;
export type Occupation = number[];

export type BeamSplitterComponent = {
  id: string;
  type: "beam_splitter";
  column: ColumnIndex;
  rails: [RailIndex, RailIndex];
  params: {
    theta: number;
  };
};

export type PhaseShifterComponent = {
  id: string;
  type: "phase_shifter";
  column: ColumnIndex;
  rail: RailIndex;
  params: {
    phi: number;
  };
};

export type SwapComponent = {
  id: string;
  type: "swap";
  column: ColumnIndex;
  rails: [RailIndex, RailIndex];
};

export type CircuitComponent =
  | BeamSplitterComponent
  | PhaseShifterComponent
  | SwapComponent;

export type DistinguishabilityConfig = {
  model: "global_overlap";
  overlap: number;
};

export type SimulationOptions = {
  includeIntermediateStates: boolean;
  shots: number;
  includeSamples: boolean;
  maxDisplayedBasisStates: number;
};

export type SimulationRequest = {
  railCount: number;
  inputState: Occupation;
  components: CircuitComponent[];
  distinguishability: DistinguishabilityConfig;
  options: SimulationOptions;
};

export type BasisStateSummary = {
  occupation: Occupation;
  amplitudeRe?: number;
  amplitudeIm?: number;
  probability: number;
};

export type IntermediateState = {
  step: number;
  column: number;
  label: string;
  basisStates: BasisStateSummary[];
};

export type FinalDistributionEntry = {
  occupation: Occupation;
  probability: number;
};

export type SampledDistributionEntry = {
  occupation: Occupation;
  count: number;
  frequency: number;
};

export type SimulationValidation = {
  isValid: boolean;
  messages: string[];
};

export type SimulationMetadata = {
  railCount: number;
  photonCount: number;
  componentCount: number;
  columnsUsed: number;
};

export type SimulationDebug = {
  unitaryRe?: number[][];
  unitaryIm?: number[][];
};

export type SampledIntermediateState = {
  step: number;
  column: number;
  label: string;
  basisStates: SampledDistributionEntry[];
};

export type TheoryColumnOperator = {
  column: number;
  label: string;
  components: string[];
  matrixRe?: number[][];
  matrixIm?: number[][];
};

export type TheorySnapshot = {
  step: number;
  column: number;
  label: string;
  columnOperators: TheoryColumnOperator[];
  cumulativeOperatorRe?: number[][];
  cumulativeOperatorIm?: number[][];
  outputState: BasisStateSummary[];
};

export type TheoryData = {
  inputOccupation: Occupation;
  snapshots: TheorySnapshot[];
};

export type SimulationResponse = {
  metadata: SimulationMetadata;
  validation: SimulationValidation;
  intermediateStates: IntermediateState[];
  sampledIntermediateStates?: SampledIntermediateState[];
  finalDistribution: FinalDistributionEntry[];
  sampledDistribution?: SampledDistributionEntry[];
  debug?: SimulationDebug;
  theory?: TheoryData;
};

export type ToolboxItemType = "beam_splitter" | "phase_shifter" | "swap";

export type SelectedComponentRef = {
  id: string | null;
};

export type GridCell = {
  rail: number;
  column: number;
};