from __future__ import annotations

from typing import Dict, List, Optional

import perceval as pcvl
from perceval.algorithm import Sampler
from perceval.utils import BasicState

from app.schemas import (
    BasisStateSummary,
    IntermediateState,
    OverlapSweepCurve,
    OverlapSweepData,
    OverlapSweepStep,
    SampledIntermediateState,
    SimulationDebug,
    SimulationMetadata,
    SimulationRequest,
    SimulationResponse,
    SimulationValidation,
    TheoryColumnOperator,
    TheoryData,
    TheorySnapshot,
)
from app.services.perceval_adapter import (
    build_basic_state,
    build_column_circuit,
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


def _compute_exact_distribution_for_overlap(
    circuit: pcvl.Circuit,
    input_state: BasicState,
    overlap: float,
):
    probs_dict = _processor_probs(
        circuit=circuit,
        input_state=input_state,
        overlap=overlap,
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


def _compute_intermediate_exact_states(
    request: SimulationRequest,
) -> List[IntermediateState]:
    if not request.options.includeIntermediateStates:
        return []

    input_state = build_basic_state(request.inputState)
    total_columns = columns_used(request.components)

    states: List[IntermediateState] = [
        IntermediateState(
            step=0,
            column=-1,
            label="Input",
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
        prefix_circuit = build_prefix_circuit(
            request, upto_exclusive_column=column + 1
        )
        distribution = _compute_exact_distribution_for_circuit(
            request=request,
            circuit=prefix_circuit,
            input_state=input_state,
        )

        states.append(
            IntermediateState(
                step=column + 1,
                column=column,
                label=f"C{column + 1}",
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
            label="Input",
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
        prefix_circuit = build_prefix_circuit(
            request, upto_exclusive_column=column + 1
        )
        sampled_distribution = _compute_sampled_distribution_for_circuit(
            request=request,
            circuit=prefix_circuit,
            input_state=input_state,
        )

        states.append(
            SampledIntermediateState(
                step=column + 1,
                column=column,
                label=f"C{column + 1}",
                basisStates=sampled_distribution or [],
            )
        )

    return states


def _matrix_lists_from_circuit(
    circuit: pcvl.Circuit,
) -> tuple[Optional[List[List[float]]], Optional[List[List[float]]]]:
    try:
        unitary = circuit.compute_unitary()
        unitary_list = unitary.tolist()
        matrix_re = [[float(value.real) for value in row] for row in unitary_list]
        matrix_im = [[float(value.imag) for value in row] for row in unitary_list]
        return matrix_re, matrix_im
    except Exception:
        return None, None


def _build_simulator(circuit: pcvl.Circuit):
    try:
        return pcvl.SimulatorFactory.build(circuit, backend="SLOS")
    except AttributeError:
        from perceval.simulators import SimulatorFactory

        return SimulatorFactory.build(circuit, backend="SLOS")


def _statevector_to_basis_state_summaries(
    state_vector,
    max_states: int,
) -> List[BasisStateSummary]:
    entries: List[BasisStateSummary] = []

    for state, amplitude in state_vector:
        amp = complex(amplitude)
        entries.append(
            BasisStateSummary(
                occupation=list(state),
                amplitudeRe=float(amp.real),
                amplitudeIm=float(amp.imag),
                probability=float(abs(amp) ** 2),
            )
        )

    entries.sort(
        key=lambda entry: (-entry.probability, tuple(entry.occupation))
    )
    return entries[:max_states]


def _compute_ideal_output_state_for_circuit(
    request: SimulationRequest,
    circuit: pcvl.Circuit,
    input_state: BasicState,
) -> List[BasisStateSummary]:
    simulator = _build_simulator(circuit)
    output_state_vector = simulator.evolve(input_state)
    return _statevector_to_basis_state_summaries(
        output_state_vector,
        request.options.maxDisplayedBasisStates,
    )


def _component_summary(component) -> str:
    if component.type == "beam_splitter":
        top = min(component.rails) + 1
        bottom = max(component.rails) + 1
        return (
            f"BS(θ={component.params.theta:.3f}) on rails {top}-{bottom}"
        )

    if component.type == "phase_shifter":
        return f"PS(φ={component.params.phi:.3f}) on rail {component.rail + 1}"

    if component.type == "swap":
        top = min(component.rails) + 1
        bottom = max(component.rails) + 1
        return f"SWAP on rails {top}-{bottom}"

    return component.type


def _compute_theory_data(request: SimulationRequest) -> TheoryData:
    total_columns = columns_used(request.components)
    input_state = build_basic_state(request.inputState)

    column_operators: List[TheoryColumnOperator] = []
    snapshots: List[TheorySnapshot] = []

    for column in range(total_columns):
        column_circuit = build_column_circuit(
            rail_count=request.railCount,
            components=request.components,
            column=column,
        )
        column_re, column_im = _matrix_lists_from_circuit(column_circuit)

        column_components = [
            _component_summary(component)
            for component in request.components
            if component.column == column
        ]

        column_operators.append(
            TheoryColumnOperator(
                column=column,
                label=f"C{column + 1}",
                components=column_components,
                matrixRe=column_re,
                matrixIm=column_im,
            )
        )

    for column in range(total_columns):
        prefix_circuit = build_prefix_circuit(
            request=request,
            upto_exclusive_column=column + 1,
        )
        cumulative_re, cumulative_im = _matrix_lists_from_circuit(prefix_circuit)
        output_state = _compute_ideal_output_state_for_circuit(
            request=request,
            circuit=prefix_circuit,
            input_state=input_state,
        )

        snapshots.append(
            TheorySnapshot(
                step=column + 1,
                column=column,
                label=f"C{column + 1}",
                columnOperators=column_operators[: column + 1],
                cumulativeOperatorRe=cumulative_re,
                cumulativeOperatorIm=cumulative_im,
                outputState=output_state,
            )
        )

    return TheoryData(
        inputOccupation=list(request.inputState),
        snapshots=snapshots,
    )


def _generate_overlap_values(
    min_overlap: float,
    max_overlap: float,
    points: int,
    return_to_start: bool,
) -> List[float]:
    min_clamped = min(1.0, max(0.0, float(min_overlap)))
    max_clamped = min(1.0, max(0.0, float(max_overlap)))

    start = min(min_clamped, max_clamped)
    end = max(min_clamped, max_clamped)

    point_count = min(101, max(2, int(points)))

    if point_count == 1:
        values = [start]
    else:
        step = (end - start) / (point_count - 1)
        values = [start + i * step for i in range(point_count)]

    if return_to_start and len(values) > 1:
        values = values + values[-2::-1]

    return [round(value, 6) for value in values]


def _occupation_key(occupation: List[int]) -> tuple[int, ...]:
    return tuple(int(value) for value in occupation)


def _compute_overlap_sweep_data(
    request: SimulationRequest,
) -> Optional[OverlapSweepData]:
    sweep_options = request.options.overlapSweep

    if not sweep_options.enabled:
        return None

    total_columns = columns_used(request.components)
    if total_columns <= 0:
        return OverlapSweepData(
            minOverlap=sweep_options.minOverlap,
            maxOverlap=sweep_options.maxOverlap,
            points=sweep_options.points,
            returnToStart=sweep_options.returnToStart,
            steps=[],
        )

    input_state = build_basic_state(request.inputState)
    overlap_values = _generate_overlap_values(
        min_overlap=sweep_options.minOverlap,
        max_overlap=sweep_options.maxOverlap,
        points=sweep_options.points,
        return_to_start=sweep_options.returnToStart,
    )

    sweep_steps: List[OverlapSweepStep] = []

    for column in range(total_columns):
        prefix_circuit = build_prefix_circuit(
            request=request,
            upto_exclusive_column=column + 1,
        )

        probabilities_by_occupation: Dict[tuple[int, ...], List[float]] = {}

        for overlap in overlap_values:
            distribution = _compute_exact_distribution_for_overlap(
                circuit=prefix_circuit,
                input_state=input_state,
                overlap=overlap,
            )

            current_probabilities: Dict[tuple[int, ...], float] = {
                _occupation_key(entry.occupation): float(entry.probability)
                for entry in distribution
            }

            all_known_keys = set(probabilities_by_occupation.keys()).union(
                current_probabilities.keys()
            )

            for key in all_known_keys:
                if key not in probabilities_by_occupation:
                    probabilities_by_occupation[key] = [0.0] * (
                        len(overlap_values)
                    )

                probabilities_by_occupation[key][
                    len(probabilities_by_occupation[key])
                    - (len(overlap_values) - overlap_values.index(overlap))
                ] = current_probabilities.get(key, 0.0)

        curves: List[OverlapSweepCurve] = []

        for occupation_key, probabilities in probabilities_by_occupation.items():
            curves.append(
                OverlapSweepCurve(
                    occupation=list(occupation_key),
                    probabilities=probabilities,
                )
            )

        curves.sort(
            key=lambda curve: (
                -max(curve.probabilities) if curve.probabilities else 0.0,
                tuple(curve.occupation),
            )
        )

        sweep_steps.append(
            OverlapSweepStep(
                step=column + 1,
                column=column,
                label=f"C{column + 1}",
                overlapValues=overlap_values,
                curves=curves,
            )
        )

    return OverlapSweepData(
        minOverlap=sweep_options.minOverlap,
        maxOverlap=sweep_options.maxOverlap,
        points=sweep_options.points,
        returnToStart=sweep_options.returnToStart,
        steps=sweep_steps,
    )


def _compute_debug_unitary(circuit: pcvl.Circuit) -> SimulationDebug:
    matrix_re, matrix_im = _matrix_lists_from_circuit(circuit)
    return SimulationDebug(unitaryRe=matrix_re, unitaryIm=matrix_im)


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
    theory = _compute_theory_data(request)
    overlap_sweep = _compute_overlap_sweep_data(request)

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
        theory=theory,
        overlapSweep=overlap_sweep,
    )