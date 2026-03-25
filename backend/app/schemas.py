from typing import List, Literal, Optional, Union, Annotated

from pydantic import BaseModel, Field


class BeamSplitterParams(BaseModel):
    theta: float


class PhaseShifterParams(BaseModel):
    phi: float


class BeamSplitterComponent(BaseModel):
    id: str
    type: Literal["beam_splitter"]
    column: int
    rails: List[int] = Field(min_length=2, max_length=2)
    params: BeamSplitterParams


class PhaseShifterComponent(BaseModel):
    id: str
    type: Literal["phase_shifter"]
    column: int
    rail: int
    params: PhaseShifterParams


class SwapComponent(BaseModel):
    id: str
    type: Literal["swap"]
    column: int
    rails: List[int] = Field(min_length=2, max_length=2)


CircuitComponent = Annotated[
    Union[BeamSplitterComponent, PhaseShifterComponent, SwapComponent],
    Field(discriminator="type"),
]


class DistinguishabilityConfig(BaseModel):
    model: Literal["global_overlap"]
    overlap: float


class SimulationOptions(BaseModel):
    includeIntermediateStates: bool = True
    shots: int = 1000
    includeSamples: bool = True
    maxDisplayedBasisStates: int = 32


class SimulationRequest(BaseModel):
    railCount: int
    inputState: List[int]
    components: List[CircuitComponent]
    distinguishability: DistinguishabilityConfig
    options: SimulationOptions


class BasisStateSummary(BaseModel):
    occupation: List[int]
    amplitudeRe: Optional[float] = None
    amplitudeIm: Optional[float] = None
    probability: float


class IntermediateState(BaseModel):
    step: int
    column: int
    label: str
    basisStates: List[BasisStateSummary]


class FinalDistributionEntry(BaseModel):
    occupation: List[int]
    probability: float


class SampledDistributionEntry(BaseModel):
    occupation: List[int]
    count: int
    frequency: float


class SampledIntermediateState(BaseModel):
    step: int
    column: int
    label: str
    basisStates: List[SampledDistributionEntry]


class SimulationValidation(BaseModel):
    isValid: bool
    messages: List[str]


class SimulationMetadata(BaseModel):
    railCount: int
    photonCount: int
    componentCount: int
    columnsUsed: int


class SimulationDebug(BaseModel):
    unitaryRe: Optional[List[List[float]]] = None
    unitaryIm: Optional[List[List[float]]] = None


class SimulationResponse(BaseModel):
    metadata: SimulationMetadata
    validation: SimulationValidation
    intermediateStates: List[IntermediateState]
    sampledIntermediateStates: Optional[List[SampledIntermediateState]] = None
    finalDistribution: List[FinalDistributionEntry]
    sampledDistribution: Optional[List[SampledDistributionEntry]] = None
    debug: Optional[SimulationDebug] = None