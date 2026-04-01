import React from "react";
import { BlockMath } from "react-katex";
import { useExperimentStore } from "@/store/useExperimentStore";
import type {
  BasisStateSummary,
  TheoryColumnOperator,
  TheorySnapshot,
} from "@/types/simulation";

const panelStyle: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 16,
  background: "#ffffff",
  padding: 16,
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 10,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  background: "#f8fafc",
  padding: 12,
};

const tableHeaderStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 800,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: 0.4,
  borderBottom: "1px solid #e2e8f0",
};

const tableCellStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: 13,
  color: "#334155",
};

const monoCellStyle: React.CSSProperties = {
  ...tableCellStyle,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

function formatReal(value: number): string {
  const clean = Math.abs(value) < 1e-10 ? 0 : value;
  return Number(clean.toFixed(3)).toString();
}

function formatComplex(re = 0, im = 0): string {
  const cleanRe = Math.abs(re) < 1e-10 ? 0 : re;
  const cleanIm = Math.abs(im) < 1e-10 ? 0 : im;

  if (cleanRe === 0 && cleanIm === 0) return "0";
  if (cleanIm === 0) return formatReal(cleanRe);
  if (cleanRe === 0) return `${formatReal(cleanIm)}i`;

  const sign = cleanIm >= 0 ? "+" : "-";
  return `${formatReal(cleanRe)} ${sign} ${formatReal(Math.abs(cleanIm))}i`;
}

function ketLatex(occupation: number[]): string {
  return `\\left|${occupation.join(",")}\\right\\rangle`;
}

function matrixToLatex(
  matrixRe?: number[][],
  matrixIm?: number[][]
): string | null {
  if (!matrixRe || !matrixIm) return null;
  if (matrixRe.length === 0 || matrixIm.length === 0) return null;

  const rows = matrixRe.map((row, rowIndex) => {
    const cells = row.map((value, colIndex) =>
      formatComplex(value, matrixIm[rowIndex]?.[colIndex] ?? 0)
    );
    return cells.join(" & ");
  });

  return `\\begin{bmatrix}${rows.join(" \\\\ ")}\\end{bmatrix}`;
}

function stateVectorToLatex(states: BasisStateSummary[], maxTerms = 8): string {
  const terms = states
    .filter(
      (state) =>
        Math.abs(state.amplitudeRe ?? 0) > 1e-10 ||
        Math.abs(state.amplitudeIm ?? 0) > 1e-10
    )
    .slice(0, maxTerms)
    .map((state) => {
      const amplitude = formatComplex(
        state.amplitudeRe ?? 0,
        state.amplitudeIm ?? 0
      );
      return `\\left(${amplitude}\\right)\\,${ketLatex(state.occupation)}`;
    });

  if (terms.length === 0) {
    return "0";
  }

  const hasMore = states.length > maxTerms;
  return hasMore ? `${terms.join(" + ")} + \\cdots` : terms.join(" + ");
}

function multiplicationLatex(snapshot: TheorySnapshot): string {
  const factors = [...snapshot.columnOperators]
    .reverse()
    .map((operator) => `U_{\\mathrm{${operator.label}}}`)
    .join(" ");

  return `U_{\\leq \\mathrm{${snapshot.label}}} = ${factors}`;
}

function renderComponentSummary(operator: TheoryColumnOperator): string {
  if (!operator.components || operator.components.length === 0) {
    return "Identity on this column";
  }
  return operator.components.join(" · ");
}

const TheoryPanel: React.FC = () => {
  const results = useExperimentStore((state) => state.results);
  const selectedStep = useExperimentStore((state) => state.selectedStep);

  const theory = results?.theory;

  if (!results || !theory) {
    return (
      <div style={panelStyle}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 12,
          }}
        >
          Theory Panel
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: 13,
            color: "#475569",
            lineHeight: 1.5,
          }}
        >
          Run a simulation to generate the ideal operator matrices and state-vector
          evolution for each circuit column.
        </div>
      </div>
    );
  }

  if (!theory.snapshots || theory.snapshots.length === 0) {
    return (
      <div style={panelStyle}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 12,
          }}
        >
          Theory Panel
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: 13,
            color: "#475569",
            lineHeight: 1.5,
          }}
        >
          Add at least one circuit column and run the experiment to see the
          theoretical matrices and output state vectors.
        </div>
      </div>
    );
  }

  const selectedSnapshot =
    theory.snapshots.find((snapshot) => snapshot.column === selectedStep) ??
    theory.snapshots[0];

  const cumulativeMatrixLatex = matrixToLatex(
    selectedSnapshot.cumulativeOperatorRe,
    selectedSnapshot.cumulativeOperatorIm
  );

  const inputStateLatex = `\\left|\\psi_{\\mathrm{in}}\\right\\rangle = ${ketLatex(
    theory.inputOccupation
  )}`;

  const outputStateLatex = `\\left|\\psi_{\\mathrm{out}}^{(${selectedSnapshot.label})}\\right\\rangle = ${stateVectorToLatex(
    selectedSnapshot.outputState
  )}`;

  return (
    <div style={panelStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 4,
            }}
          >
            Theory Panel
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#475569",
              lineHeight: 1.5,
            }}
          >
            Ideal unitary mathematics up to the selected column. Click a column in
            the circuit grid to inspect the operator chain and the exact output
            state vector at that stage.
          </div>
        </div>

        <div
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            fontSize: 13,
            fontWeight: 700,
            color: "#1d4ed8",
          }}
        >
          Selected stage: {selectedSnapshot.label}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>Input state</div>
          <BlockMath math={inputStateLatex} />
        </div>

        <div style={cardStyle}>
          <div style={sectionTitleStyle}>Matrix multiplication</div>
          <BlockMath math={multiplicationLatex(selectedSnapshot)} />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={sectionTitleStyle}>Column operators</div>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {selectedSnapshot.columnOperators.map((operator) => {
            const operatorMatrixLatex = matrixToLatex(
              operator.matrixRe,
              operator.matrixIm
            );

            return (
              <div
                key={operator.column}
                style={{
                  ...cardStyle,
                  background:
                    operator.column === selectedSnapshot.column
                      ? "#eff6ff"
                      : "#f8fafc",
                  border:
                    operator.column === selectedSnapshot.column
                      ? "1px solid #bfdbfe"
                      : "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: 6,
                  }}
                >
                  {operator.label}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#475569",
                    lineHeight: 1.5,
                    marginBottom: 10,
                  }}
                >
                  {renderComponentSummary(operator)}
                </div>

                {operatorMatrixLatex ? (
                  <BlockMath
                    math={`U_{\\mathrm{${operator.label}}} = ${operatorMatrixLatex}`}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                    }}
                  >
                    Matrix unavailable for this operator.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>Cumulative operator</div>
          {cumulativeMatrixLatex ? (
            <BlockMath
              math={`U_{\\leq \\mathrm{${selectedSnapshot.label}}} = ${cumulativeMatrixLatex}`}
            />
          ) : (
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
              }}
            >
              Cumulative matrix unavailable for this stage.
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={sectionTitleStyle}>Output state vector</div>
          <BlockMath math={outputStateLatex} />
        </div>
      </div>

      <div>
        <div style={sectionTitleStyle}>Basis amplitudes and probabilities</div>

        <div
          style={{
            overflowX: "auto",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 640,
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={tableHeaderStyle}>Basis state</th>
                <th style={tableHeaderStyle}>Amplitude</th>
                <th style={tableHeaderStyle}>Probability</th>
              </tr>
            </thead>

            <tbody>
              {selectedSnapshot.outputState.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      padding: 16,
                      fontSize: 13,
                      color: "#64748b",
                    }}
                  >
                    No output-state data available for this stage.
                  </td>
                </tr>
              ) : (
                selectedSnapshot.outputState.map((state, index) => (
                  <tr key={`${index}-${state.occupation.join(",")}`}>
                    <td style={monoCellStyle}>
                      |{state.occupation.join(",")}⟩
                    </td>
                    <td style={monoCellStyle}>
                      {formatComplex(state.amplitudeRe ?? 0, state.amplitudeIm ?? 0)}
                    </td>
                    <td style={tableCellStyle}>{state.probability.toFixed(4)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TheoryPanel;