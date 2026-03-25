import type { SimulationRequest, SimulationResponse } from "@/types/simulation";

const API_BASE_URL = "http://localhost:8000";

export async function simulateCircuit(
  payload: SimulationRequest
): Promise<SimulationResponse> {
  const res = await fetch(`${API_BASE_URL}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Simulation failed: ${res.status} ${text}`);
  }

  return res.json();
}
