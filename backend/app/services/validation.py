from app.schemas import SimulationRequest


def validate_simulation_request(request: SimulationRequest) -> list[str]:
    messages: list[str] = []

    if request.railCount < 2 or request.railCount > 6:
        messages.append("railCount must be between 2 and 6.")

    if len(request.inputState) != request.railCount:
        messages.append("inputState length must match railCount.")

    if any(n < 0 for n in request.inputState):
        messages.append("inputState entries must be non-negative.")

    if request.distinguishability.overlap < 0 or request.distinguishability.overlap > 1:
        messages.append("overlap must be between 0 and 1.")

    used_slots = set()

    for c in request.components:
        if c.column < 0:
            messages.append(f"Component {c.id} has invalid negative column.")

        if c.type == "beam_splitter":
            r0, r1 = c.rails
            if abs(r0 - r1) != 1:
                messages.append(f"Beam splitter {c.id} must connect adjacent rails.")
            for r in c.rails:
                if r < 0 or r >= request.railCount:
                    messages.append(f"Beam splitter {c.id} uses out-of-range rail {r}.")
            for r in c.rails:
                key = (c.column, r)
                if key in used_slots:
                    messages.append(
                        f"Rail {r} in column {c.column} is occupied more than once."
                    )
                used_slots.add(key)

        elif c.type == "phase_shifter":
            if c.rail < 0 or c.rail >= request.railCount:
                messages.append(f"Phase shifter {c.id} uses out-of-range rail {c.rail}.")
            key = (c.column, c.rail)
            if key in used_slots:
                messages.append(
                    f"Rail {c.rail} in column {c.column} is occupied more than once."
                )
            used_slots.add(key)

        elif c.type == "swap":
            r0, r1 = c.rails
            if r0 == r1:
                messages.append(f"Swap {c.id} must use two distinct rails.")
            if abs(r0 - r1) != 1:
                messages.append(f"Swap {c.id} must connect adjacent rails.")
            for r in c.rails:
                if r < 0 or r >= request.railCount:
                    messages.append(f"Swap {c.id} uses out-of-range rail {r}.")
            for r in c.rails:
                key = (c.column, r)
                if key in used_slots:
                    messages.append(
                        f"Rail {r} in column {c.column} is occupied more than once."
                    )
                used_slots.add(key)

    return messages