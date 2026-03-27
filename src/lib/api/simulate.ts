import type { SimulationRequest, SimulationResponse } from "@/types/simulation";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://3pbme9nwx2.ap-southeast-2.awsapprunner.com/";

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
