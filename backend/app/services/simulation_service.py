from __future__ import annotations

from typing import Dict, List

import perceval as pcvl
from perceval.algorithm import Sampler
from perceval.utils import BasicState

from app.schemas import (
    BasisStateSummary,
    IntermediateState,
    SampledIntermediateState,
    SimulationDebug,
    SimulationMetadata,
    SimulationRequest,
    SimulationResponse,
    SimulationValidation,
)
from app.services.perceval_adapter import (
    build_basic_state,
    build_full_circuit,
    build_prefix_circuit,
    columns_used,
    distribution_to_entries,
)


def _photon_count(input_state: List[int]) -> int:
    return sum(input_state)


def _make_processor(
    circuit: pcvl.Circuit,
    input_state: BasicState,
    overlap: float,
) -> pcvl.Processor:
    """
    Build a Perceval processor with a noise model driven by the UI slider.

    overlap = 1.0 -> fully indistinguishable
    overlap = 0.0 -> fully distinguishable
    """
    noise_model = pcvl.NoiseModel(indistinguishability=overlap)
    processor = pcvl.Processor("SLOS", circuit, noise=noise_model)
    processor.min_detected_photons_filter(0)
    processor.with_input(input_state)
    return processor


def _processor_probs(
    circuit: pcvl.Circuit,
    input_state: BasicState,
    overlap: float,
) -> Dict[BasicState, float]:
    processor = _make_processor(circuit, input_state, overlap)
    sampler = Sampler(processor)
    result = sampler.probs()
    return result["results"]


def _processor_sample_count(
    circuit: pcvl.Circuit,
    input_state: BasicState,
    overlap: float,
    shots: int,
) -> Dict[BasicState, int]:
    processor = _make_processor(circuit, input_state, overlap)
    sampler = Sampler(processor)
    # Perceval renamed count -> max_samples in newer versions
    result = sampler.sample_count(max_samples=shots)
    return result["results"]


def _counts_to_sampled_entries(
    counts_dict: Dict[BasicState, int],
    shots: int,
):
    from app.schemas import SampledDistributionEntry

    entries: List[SampledDistributionEntry] = []

    for state, count in counts_dict.items():
        entries.append(
            SampledDistributionEntry(
                occupation=list(state),
                count=int(count),
                frequency=(float(count) / shots if shots > 0 else 0.0),
            )
        )

    entries.sort(key=lambda x: tuple(x.occupation), reverse=True)
    return entries


def _distribution_to_basis_state_summaries(distribution):
    return [
        BasisStateSummary(
            occupation=entry.occupation,
            amplitudeRe=None,
            amplitudeIm=None,
            probability=entry.probability,
        )
        for entry in distribution
    ]


def _compute_exact_distribution_for_circuit(
    request: SimulationRequest,
    circuit: pcvl.Circuit,
    input_state: BasicState,
):
    probs_dict = _processor_probs(
        circuit=circuit,
        input_state=input_state,
        overlap=request.distinguishability.overlap,
    )
    return distribution_to_entries(probs_dict)


def _compute_sampled_distribution_for_circuit(
    request: SimulationRequest,
    circuit: pcvl.Circuit,
    input_state: BasicState,
):
    if not request.options.includeSamples:
        return None

    counts_dict = _processor_sample_count(
        circuit=circuit,
        input_state=input_state,
        overlap=request.distinguishability.overlap,
        shots=request.options.shots,
    )
    return _counts_to_sampled_entries(counts_dict, request.options.shots)


def _compute_intermediate_exact_states(request: SimulationRequest) -> List[IntermediateState]:
    if not request.options.includeIntermediateStates:
        return []

    input_state = build_basic_state(request.inputState)
    total_columns = columns_used(request.components)

    states: List[IntermediateState] = [
        IntermediateState(
            step=0,
            column=-1,
            label="input",
            basisStates=[
                BasisStateSummary(
                    occupation=list(request.inputState),
                    amplitudeRe=1.0,
                    amplitudeIm=0.0,
                    probability=1.0,
                )
            ],
        )
    ]

    for column in range(total_columns):
        prefix_circuit = build_prefix_circuit(request, upto_exclusive_column=column + 1)
        distribution = _compute_exact_distribution_for_circuit(
            request=request,
            circuit=prefix_circuit,
            input_state=input_state,
        )

        states.append(
            IntermediateState(
                step=column + 1,
                column=column,
                label=f"after column {column}",
                basisStates=_distribution_to_basis_state_summaries(distribution),
            )
        )

    return states


def _compute_intermediate_sampled_states(
    request: SimulationRequest,
) -> List[SampledIntermediateState] | None:
    if not request.options.includeIntermediateStates or not request.options.includeSamples:
        return None

    input_state = build_basic_state(request.inputState)
    total_columns = columns_used(request.components)
    shots = request.options.shots

    from app.schemas import SampledDistributionEntry

    states: List[SampledIntermediateState] = [
        SampledIntermediateState(
            step=0,
            column=-1,
            label="input",
            basisStates=[
                SampledDistributionEntry(
                    occupation=list(request.inputState),
                    count=shots,
                    frequency=1.0,
                )
            ],
        )
    ]

    for column in range(total_columns):
        prefix_circuit = build_prefix_circuit(request, upto_exclusive_column=column + 1)
        sampled_distribution = _compute_sampled_distribution_for_circuit(
            request=request,
            circuit=prefix_circuit,
            input_state=input_state,
        )

        states.append(
            SampledIntermediateState(
                step=column + 1,
                column=column,
                label=f"after column {column}",
                basisStates=sampled_distribution or [],
            )
        )

    return states


def _compute_debug_unitary(circuit: pcvl.Circuit) -> SimulationDebug:
    try:
        U = circuit.compute_unitary()
        unitary_re = [[float(z.real) for z in row] for row in U.tolist()]
        unitary_im = [[float(z.imag) for z in row] for row in U.tolist()]
        return SimulationDebug(unitaryRe=unitary_re, unitaryIm=unitary_im)
    except Exception:
        return SimulationDebug(unitaryRe=None, unitaryIm=None)


def run_simulation(request: SimulationRequest) -> SimulationResponse:
    input_state = build_basic_state(request.inputState)
    full_circuit = build_full_circuit(request)

    final_distribution = _compute_exact_distribution_for_circuit(
        request=request,
        circuit=full_circuit,
        input_state=input_state,
    )

    sampled_distribution = _compute_sampled_distribution_for_circuit(
        request=request,
        circuit=full_circuit,
        input_state=input_state,
    )

    intermediate_states = _compute_intermediate_exact_states(request)
    sampled_intermediate_states = _compute_intermediate_sampled_states(request)

    metadata = SimulationMetadata(
        railCount=request.railCount,
        photonCount=_photon_count(request.inputState),
        componentCount=len(request.components),
        columnsUsed=columns_used(request.components),
    )

    validation = SimulationValidation(
        isValid=True,
        messages=[],
    )

    debug = _compute_debug_unitary(full_circuit)

    return SimulationResponse(
        metadata=metadata,
        validation=validation,
        intermediateStates=intermediate_states,
        sampledIntermediateStates=sampled_intermediate_states,
        finalDistribution=final_distribution,
        sampledDistribution=sampled_distribution,
        debug=debug,
    )