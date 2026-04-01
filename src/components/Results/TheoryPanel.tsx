import React from "react";
import katex from "katex";
import { useExperimentStore } from "@/store/useExperimentStore";
import type {
  BasisStateSummary,
  TheorySnapshot,
} from "@/types/simulation";

const panelStyle: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 16,
  background: "#ffffff",
  padding: 16,
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  background: "#f8fafc",
  padding: 12,
  minHeight: 220,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 8,
};

const subheadingStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 10,
};

const headerTagStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  fontSize: 13,
  fontWeight: 700,
  color: "#1d4ed8",
};

function KatexBlock({ math }: { math: string }) {
  let html: string;

  try {
    html = katex.renderToString(math, {
      displayMode: true,
      throwOnError: false,
      strict: "ignore",
      output: "htmlAndMathml",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "KaTeX rendering error";
    html = `<pre style="white-space:pre-wrap;color:#b91c1c;margin:0;">${message}\n\n${math}</pre>`;
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function formatReal(value: number): string {
  const clean = Math.abs(value) < 1e-10 ? 0 : value;
  return Number(clean.toFixed(3)).toString();
}

function formatComplexLatex(re = 0, im = 0): string {
  const cleanRe = Math.abs(re) < 1e-10 ? 0 : re;
  const cleanIm = Math.abs(im) < 1e-10 ? 0 : im;

  if (cleanRe === 0 && cleanIm === 0) return "0";
  if (cleanIm === 0) return formatReal(cleanRe);

  const imagCoeff = Math.abs(cleanIm);
  const imagPart =
    Math.abs(imagCoeff - 1) < 1e-10 ? "i" : `${formatReal(imagCoeff)}i`;

  if (cleanRe === 0) {
    return cleanIm < 0 ? `-${imagPart}` : imagPart;
  }

  const sign = cleanIm >= 0 ? "+" : "-";
  return `${formatReal(cleanRe)} ${sign} ${imagPart}`;
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
      formatComplexLatex(value, matrixIm[rowIndex]?.[colIndex] ?? 0)
    );
    return cells.join(" & ");
  });

  return `\\begin{bmatrix} ${rows.join(" \\\\ ")} \\end{bmatrix}`;
}

function stateSuperpositionLatex(
  states: BasisStateSummary[],
  label: string,
  maxTerms = 8
): string {
  const filtered = states
    .filter(
      (state) =>
        Math.abs(state.amplitudeRe ?? 0) > 1e-10 ||
        Math.abs(state.amplitudeIm ?? 0) > 1e-10
    )
    .slice(0, maxTerms);

  if (filtered.length === 0) {
    return `${label} = 0`;
  }

  const lines = filtered.map((state, index) => {
    const amplitude = formatComplexLatex(
      state.amplitudeRe ?? 0,
      state.amplitudeIm ?? 0
    );
    const ket = ketLatex(state.occupation);
    const prefix = index === 0 ? "" : "+\\;";
    return `${prefix}\\left(${amplitude}\\right)${ket}`;
  });

  const hasMore = states.length > maxTerms;
  if (hasMore) {
    lines.push("+\\;\\cdots");
  }

  return `${label} =
  \\begin{aligned}
  ${lines.join(" \\\\ ")}
  \\end{aligned}`;
}

function pureInputStateLatex(
  occupation: number[],
  label: string
): string {
  return `${label} = ${ketLatex(occupation)}`;
}

function multiplicationLatex(snapshot: TheorySnapshot): string {
  const factors = [...snapshot.columnOperators]
    .reverse()
    .map((operator) => `U_{\\mathrm{${operator.label}}}`)
    .join(" ");

  return `U_{\\leq \\mathrm{${snapshot.label}}} = ${factors}`;
}

function activeColumnMatrixLabel(columnLabel: string, matrixLatex: string | null) {
  if (!matrixLatex) {
    return `U_{\\mathrm{${columnLabel}}} = \\text{matrix unavailable}`;
  }
  return `U_{\\mathrm{${columnLabel}}} = ${matrixLatex}`;
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
          theoretical matrices and state vectors.
        </div>
      </div>
    );
  }

  const selectedSnapshot =
    theory.snapshots.find((snapshot) => snapshot.column === selectedStep) ??
    theory.snapshots[0];

  const selectedIndex = theory.snapshots.findIndex(
    (snapshot) => snapshot.column === selectedSnapshot.column
  );

  const previousSnapshot =
    selectedIndex > 0 ? theory.snapshots[selectedIndex - 1] : null;

  const activeColumnOperator =
    selectedSnapshot.columnOperators[selectedSnapshot.columnOperators.length - 1] ??
    null;

  const cumulativeMatrixLatex = matrixToLatex(
    selectedSnapshot.cumulativeOperatorRe,
    selectedSnapshot.cumulativeOperatorIm
  );

  const activeColumnMatrixLatex = activeColumnOperator
    ? matrixToLatex(activeColumnOperator.matrixRe, activeColumnOperator.matrixIm)
    : null;

  const cumulativeInputLatex = pureInputStateLatex(
    theory.inputOccupation,
    "\\left|\\psi_{\\mathrm{in}}\\right\\rangle"
  );

  const cumulativeOutputLatex = stateSuperpositionLatex(
    selectedSnapshot.outputState,
    `\\left|\\psi_{\\mathrm{out}}^{(${selectedSnapshot.label})}\\right\\rangle`
  );

  const singleColumnInputLatex = previousSnapshot
    ? stateSuperpositionLatex(
        previousSnapshot.outputState,
        `\\left|\\psi_{\\mathrm{before}\\,${selectedSnapshot.label}}\\right\\rangle`
      )
    : pureInputStateLatex(
        theory.inputOccupation,
        `\\left|\\psi_{\\mathrm{before}\\,${selectedSnapshot.label}}\\right\\rangle`
      );

  const singleColumnOutputLatex = stateSuperpositionLatex(
    selectedSnapshot.outputState,
    `\\left|\\psi_{\\mathrm{after}\\,${selectedSnapshot.label}}\\right\\rangle`
  );

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
            The top row shows the cumulative action up to the selected column.
            The bottom row shows the action of the selected column alone.
          </div>
        </div>

        <div style={headerTagStyle}>Active column: {selectedSnapshot.label}</div>
      </div>

      <div
        style={{
          ...subheadingStyle,
          marginTop: 4,
        }}
      >
        Cumulative action up to {selectedSnapshot.label}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Input state</div>
          <KatexBlock math={cumulativeInputLatex} />
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Cumulative matrix</div>
          {cumulativeMatrixLatex ? (
            <>
              <KatexBlock math={multiplicationLatex(selectedSnapshot)} />
              <KatexBlock
                math={`U_{\\leq \\mathrm{${selectedSnapshot.label}}} = ${cumulativeMatrixLatex}`}
              />
            </>
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
          <div style={labelStyle}>Output state</div>
          <KatexBlock math={cumulativeOutputLatex} />
        </div>
      </div>

      <div style={subheadingStyle}>
        Action of {selectedSnapshot.label} only
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Input state to {selectedSnapshot.label}</div>
          <KatexBlock math={singleColumnInputLatex} />
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Matrix for {selectedSnapshot.label}</div>
          {activeColumnOperator ? (
            <>
              <div
                style={{
                  fontSize: 12,
                  color: "#475569",
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}
              >
                {activeColumnOperator.components.length > 0
                  ? activeColumnOperator.components.join(" · ")
                  : "Identity on this column"}
              </div>

              <KatexBlock
                math={activeColumnMatrixLabel(
                  activeColumnOperator.label,
                  activeColumnMatrixLatex
                )}
              />
            </>
          ) : (
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
              }}
            >
              No operator data available for this column.
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Output state from {selectedSnapshot.label}</div>
          <KatexBlock math={singleColumnOutputLatex} />
        </div>
      </div>
    </div>
  );
};

export default TheoryPanel;