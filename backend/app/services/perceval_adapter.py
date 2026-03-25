from __future__ import annotations

from typing import Dict, List

import perceval as pcvl
import perceval.components.unitary_components as comp
from perceval.utils import BasicState

from app.schemas import (
    CircuitComponent,
    FinalDistributionEntry,
    SimulationRequest,
)


def sort_components_by_column(
    components: List[CircuitComponent],
) -> List[CircuitComponent]:
    def sort_key(component: CircuitComponent) -> tuple[int, int]:
        if component.type == "phase_shifter":
            rail_key = component.rail
        else:
            rail_key = min(component.rails)
        return (component.column, rail_key)

    return sorted(components, key=sort_key)


def columns_used(components: List[CircuitComponent]) -> int:
    if not components:
        return 0
    return max(component.column for component in components) + 1


def components_in_column(
    components: List[CircuitComponent], column: int
) -> List[CircuitComponent]:
    return [component for component in components if component.column == column]


def build_basic_state(input_state: List[int]) -> BasicState:
    return BasicState(input_state)


def build_circuit_from_components(
    rail_count: int,
    components: List[CircuitComponent],
    max_column: int | None = None,
) -> pcvl.Circuit:
    circuit = pcvl.Circuit(rail_count)

    if max_column is None:
        max_column = columns_used(components)

    sorted_components = sort_components_by_column(components)

    for column in range(max_column):
        column_components = components_in_column(sorted_components, column)

        for component in column_components:
            if component.type == "beam_splitter":
                r0, r1 = component.rails
                top = min(r0, r1)
                circuit.add((top, top + 1), comp.BS(theta=component.params.theta))

            elif component.type == "phase_shifter":
                circuit.add(component.rail, comp.PS(component.params.phi))

            elif component.type == "swap":
                r0, r1 = component.rails
                top = min(r0, r1)
                circuit.add((top, top + 1), comp.PERM([1, 0]))

            else:
                raise ValueError(f"Unsupported component type: {component.type}")

    return circuit


def build_prefix_circuit(
    request: SimulationRequest,
    upto_exclusive_column: int,
) -> pcvl.Circuit:
    return build_circuit_from_components(
        rail_count=request.railCount,
        components=request.components,
        max_column=upto_exclusive_column,
    )


def build_full_circuit(request: SimulationRequest) -> pcvl.Circuit:
    return build_circuit_from_components(
        rail_count=request.railCount,
        components=request.components,
    )


def distribution_to_entries(
    probs_dict: Dict[BasicState, float],
) -> List[FinalDistributionEntry]:
    entries: List[FinalDistributionEntry] = []

    for state, probability in probs_dict.items():
        entries.append(
            FinalDistributionEntry(
                occupation=list(state),
                probability=float(probability),
            )
        )

    entries.sort(key=lambda x: tuple(x.occupation), reverse=True)
    return entries