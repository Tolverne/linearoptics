import React from "react";
import { useExperimentStore } from "@/store/useExperimentStore";
import { formatNiceNumber } from "@/utils/formatNumber";
import type {
  BeamSplitterComponent,
  CircuitComponent,
  PhaseShifterComponent,
  SwapComponent,
} from "@/types/simulation";


const BASE_DENOMINATORS = [6, 4, 3, 2]; // π/6, π/4, π/3, π/2

function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

function formatPiLabel(n: number, d: number): string {
    if (n === 0) return "0";
    if (n === d) return "π";
    if (n === 2 * d) return "2π";

    const divisor = gcd(n, d);
    const num = n / divisor;
    const den = d / divisor;

    if (num === 1) return `π/${den}`;
    return `${num}π/${den}`;
}

function generateAnglePresets() {
    const map = new Map<number, { label: string; value: number }>();

    // Always include key anchors
    map.set(0, { label: "0", value: 0 });
    map.set(Math.PI, { label: "π", value: Math.PI });
    map.set(2 * Math.PI, { label: "2π", value: 2 * Math.PI });

    for (const d of BASE_DENOMINATORS) {
        for (let n = 1; n <= 2 * d; n++) {
            const value = (n * Math.PI) / d;

            // round key for floating stability
            const key = Number(value.toFixed(6));

            if (!map.has(key)) {
                map.set(key, {
                    label: formatPiLabel(n, d),
                    value,
                });
            }
        }
    }

    // Sort ascending
    return Array.from(map.values()).sort((a, b) => a.value - b.value);
}

const ANGLE_PRESETS = generateAnglePresets();

function findPresetAngle(value: number): string {
    const match = ANGLE_PRESETS.find(
        (preset) => Math.abs(preset.value - value) < 1e-5
    );

    return match ? String(match.value) : "custom";
}

function getSelectedComponent(
  components: CircuitComponent[],
  selectedId: string | null
): CircuitComponent | null {
  if (!selectedId) return null;
  return components.find((component) => component.id === selectedId) ?? null;
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 12,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#334155",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  fontSize: 14,
  color: "#0f172a",
};

const infoBoxStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  fontSize: 12,
  color: "#475569",
  lineHeight: 1.5,
};

function renderBeamSplitterEditor(
  component: BeamSplitterComponent,
  updateComponent: (id: string, patch: Partial<CircuitComponent>) => void
) {
  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <label htmlFor="bs-theta" style={labelStyle}>
          θ parameter
        </label>
              <div style={{ marginBottom: 14 }}>
                  <label htmlFor="bs-theta" style={labelStyle}>
                      θ parameter
                  </label>

                  <select
                      id="bs-theta"
                      value={findPresetAngle(component.params.theta)}
                      onChange={(event) => {
                          if (event.target.value === "custom") return;

                          updateComponent(component.id, {
                              ...component,
                              params: {
                                  theta: Number(event.target.value),
                              },
                          });
                      }}
                      style={inputStyle}
                  >
                      {ANGLE_PRESETS.map((preset) => (
                          <option key={preset.label} value={preset.value}>
                              {preset.label} ({preset.value.toFixed(3)})
                          </option>
                      ))}

                      <option value="custom">
                          Custom ({formatNiceNumber(component.params.theta, { mode: "both" })})
                      </option>
                  </select>
              </div>
      </div>

      <div style={infoBoxStyle}>
        Rails {component.rails[0] + 1} and {component.rails[1] + 1}
        <br />
        Column {component.column + 1}
      </div>
    </>
  );
}

function renderPhaseShifterEditor(
  component: PhaseShifterComponent,
  updateComponent: (id: string, patch: Partial<CircuitComponent>) => void
) {
  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <label htmlFor="ps-phi" style={labelStyle}>
          φ parameter
        </label>
              <div style={{ marginBottom: 14 }}>
                  <label htmlFor="ps-phi" style={labelStyle}>
                      φ parameter
                  </label>

                  <select
                      id="ps-phi"
                      value={findPresetAngle(component.params.phi)}
                      onChange={(event) => {
                          if (event.target.value === "custom") return;

                          updateComponent(component.id, {
                              ...component,
                              params: {
                                  phi: Number(event.target.value),
                              },
                          });
                      }}
                      style={inputStyle}
                  >
                      {ANGLE_PRESETS.map((preset) => (
                          <option key={preset.label} value={preset.value}>
                              {preset.label} ({preset.value.toFixed(3)})
                          </option>
                      ))}

                      <option value="custom">
                          Custom ({formatNiceNumber(component.params.phi, { mode: "both" })})
                      </option>
                  </select>
              </div>
      </div>

      <div style={infoBoxStyle}>
        Rail {component.rail + 1}
        <br />
        Column {component.column + 1}
      </div>
    </>
  );
}

function renderSwapEditor(component: SwapComponent) {
  return (
    <div style={infoBoxStyle}>
      Swaps rail {component.rails[0] + 1} with rail {component.rails[1] + 1}
      <br />
      Column {component.column + 1}
    </div>
  );
}

const ComponentInspectorPanel: React.FC = () => {
  const components = useExperimentStore((state) => state.components);
  const selectedComponentId = useExperimentStore(
    (state) => state.selectedComponentId
  );
  const updateComponent = useExperimentStore((state) => state.updateComponent);
  const removeComponent = useExperimentStore((state) => state.removeComponent);
  const setSelectedComponentId = useExperimentStore(
    (state) => state.setSelectedComponentId
  );

  const selectedComponent = getSelectedComponent(
    components,
    selectedComponentId
  );

  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: 16,
        background: "#ffffff",
        padding: 16,
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div style={sectionTitleStyle}>Component Inspector</div>

      {!selectedComponent ? (
        <div style={infoBoxStyle}>
          Select a component on the circuit grid to inspect or edit its
          parameters.
        </div>
      ) : (
        <>
          <div
            style={{
              marginBottom: 14,
              padding: 12,
              borderRadius: 12,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#1d4ed8",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}
            >
              Selected component
            </div>

            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {selectedComponent.type === "beam_splitter" && "Beam Splitter"}
              {selectedComponent.type === "phase_shifter" && "Phase Shifter"}
              {selectedComponent.type === "swap" && "Swap"}
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "#475569",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {selectedComponent.id}
            </div>
          </div>

          {selectedComponent.type === "beam_splitter" &&
            renderBeamSplitterEditor(selectedComponent, updateComponent)}

          {selectedComponent.type === "phase_shifter" &&
            renderPhaseShifterEditor(selectedComponent, updateComponent)}

          {selectedComponent.type === "swap" &&
            renderSwapEditor(selectedComponent)}

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 16,
            }}
          >
            <button
              type="button"
              onClick={() => {
                removeComponent(selectedComponent.id);
                setSelectedComponentId(null);
              }}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Delete
            </button>

            <button
              type="button"
              onClick={() => setSelectedComponentId(null)}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Deselect
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ComponentInspectorPanel;