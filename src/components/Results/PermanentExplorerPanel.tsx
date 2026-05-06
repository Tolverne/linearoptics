// src/components/Results/PermanentExplorerPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import katex from "katex";
import { useExperimentStore } from "@/store/useExperimentStore";
import { formatNiceNumber } from "@/utils/formatNumber";

type Complex = { re: number; im: number };

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
};

const colours = [
    "#dbeafe",
    "#dcfce7",
    "#fef3c7",
    "#fae8ff",
    "#fee2e2",
    "#ccfbf1",
    "#ede9fe",
    "#ffedd5",
];

function KatexBlock({ math }: { math: string }) {
    const html = katex.renderToString(math, {
        displayMode: true,
        throwOnError: false,
        strict: "ignore",
        output: "htmlAndMathml",
    });

    return <div style={{ overflowX: "auto" }} dangerouslySetInnerHTML={{ __html: html }} />;
}

function clean(x: number) {
    return Math.abs(x) < 1e-10 ? 0 : x;
}

function formatReal(x: number) {
    const mode = useExperimentStore.getState().numericDisplayMode;
    return formatNiceNumber(clean(x), {
        mode,
        latex: true,
        decimalPlaces: 3,
    });
}

function formatComplex(z: Complex): string {
    const re = clean(z.re);
    const im = clean(z.im);

    if (re === 0 && im === 0) return "0";
    if (im === 0) return formatReal(re);

    const absIm = Math.abs(im);
    const imag = Math.abs(absIm - 1) < 1e-10 ? "i" : `${formatReal(absIm)}i`;

    if (re === 0) return im < 0 ? `-${imag}` : imag;

    return `${formatReal(re)} ${im >= 0 ? "+" : "-"} ${imag}`;
}

function add(a: Complex, b: Complex): Complex {
    return { re: a.re + b.re, im: a.im + b.im };
}

function mul(a: Complex, b: Complex): Complex {
    return {
        re: a.re * b.re - a.im * b.im,
        im: a.re * b.im + a.im * b.re,
    };
}

function factorial(n: number) {
    let out = 1;
    for (let k = 2; k <= n; k++) out *= k;
    return out;
}

function fockFactorialProduct(state: number[]) {
    return state.reduce((p, n) => p * factorial(n), 1);
}

function expandFockIndices(state: number[]) {
    const indices: number[] = [];
    state.forEach((count, rail) => {
        for (let i = 0; i < count; i++) indices.push(rail);
    });
    return indices;
}

function permanent(matrix: Complex[][]): Complex {
    const n = matrix.length;

    if (n === 0) return { re: 1, im: 0 };
    if (n === 1) return matrix[0][0];

    let total: Complex = { re: 0, im: 0 };

    for (let col = 0; col < n; col++) {
        const minor = matrix.slice(1).map((row) => row.filter((_, j) => j !== col));
        total = add(total, mul(matrix[0][col], permanent(minor)));
    }

    return total;
}

function complexMatrix(re?: number[][], im?: number[][]): Complex[][] | null {
    if (!re || re.length === 0) return null;

    return re.map((row, i) =>
        row.map((value, j) => ({
            re: value,
            im: im?.[i]?.[j] ?? 0,
        }))
    );
}

function key(row: number, col: number) {
    return `${row},${col}`;
}

function ket(state: number[]) {
    return `\\left|${state.join(",")}\\right\\rangle`;
}

function photonDots(count: number) {
    if (count === 0) return <span style={{ color: "#94a3b8" }}>empty</span>;

    return (
        <span style={{ display: "inline-flex", gap: 4 }}>
            {Array.from({ length: count }).map((_, i) => (
                <span
                    key={i}
                    style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: "#0f172a",
                        display: "inline-block",
                    }}
                />
            ))}
        </span>
    );
}

const buttonStyle: React.CSSProperties = {
    width: 30,
    height: 28,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontWeight: 800,
    cursor: "pointer",
};

const cellStyle: React.CSSProperties = {
    border: "1px solid #cbd5e1",
    padding: "8px 10px",
    textAlign: "center",
    minWidth: 74,
};

const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    background: "#f1f5f9",
    fontWeight: 800,
    color: "#334155",
};

export default function PermanentExplorerPanel() {
    const inputState = useExperimentStore((s) => s.inputState);
    const railCount = useExperimentStore((s) => s.railCount);
    const results = useExperimentStore((s) => s.results);
    const selectedStep = useExperimentStore((s) => s.selectedStep);

    const [outputState, setOutputState] = useState<number[]>(inputState);

    useEffect(() => {
        setOutputState(inputState.slice(0, railCount));
    }, [inputState, railCount]);

    const snapshots = results?.theory?.snapshots ?? [];
    const selectedSnapshot =
        snapshots.find((snapshot) => snapshot.column === selectedStep) ??
        snapshots[snapshots.length - 1];

    const unitary = useMemo(
        () =>
            complexMatrix(
                selectedSnapshot?.cumulativeOperatorRe,
                selectedSnapshot?.cumulativeOperatorIm
            ),
        [selectedSnapshot]
    );

    if (!results || !selectedSnapshot || !unitary) {
        return (
            <div style={panelStyle}>
                <h3 style={{ marginTop: 0 }}>Permanent Explorer</h3>
                <div style={cardStyle}>
                    Run a simulation to generate the cumulative unitary. The permanent explorer
                    will then show how a chosen output state creates the repeated submatrix.
                </div>
            </div>
        );
    }

    const inputRails = expandFockIndices(inputState);
    const outputRails = expandFockIndices(outputState);

    const submatrix = outputRails.map((outRail) =>
        inputRails.map((inRail) => unitary[outRail][inRail])
    );

    const highlight = new Map<string, string>();
    outputRails.forEach((r) => {
        inputRails.forEach((c) => {
            const k = key(r, c);
            if (!highlight.has(k)) highlight.set(k, colours[highlight.size % colours.length]);
        });
    });

    const photonCount = inputState.reduce((a, b) => a + b, 0);
    const outputCount = outputState.reduce((a, b) => a + b, 0);
    const valid = photonCount === outputCount;

    const per = valid ? permanent(submatrix) : { re: 0, im: 0 };
    const norm = Math.sqrt(
        fockFactorialProduct(inputState) * fockFactorialProduct(outputState)
    );
    const amplitude = valid ? { re: per.re / norm, im: per.im / norm } : { re: 0, im: 0 };
    const probability = amplitude.re ** 2 + amplitude.im ** 2;

    function changeOutputRail(rail: number, delta: number) {
        setOutputState((current) => {
            const next = [...current];
            const total = current.reduce((a, b) => a + b, 0);
            const proposed = Math.max(0, next[rail] + delta);

            if (delta > 0 && total >= photonCount) return current;

            next[rail] = proposed;
            return next;
        });
    }

    return (
        <div style={panelStyle}>
            <div style={{ marginBottom: 14 }}>
                <h3 style={{ margin: 0, color: "#0f172a" }}>Permanent Explorer</h3>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                    Choose a candidate output state. The highlighted entries show which amplitudes
                    from the cumulative unitary are copied into the repeated submatrix.
                </p>
            </div>

            <div className="export-target">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "280px minmax(0, 1fr)",
                        gap: 16,
                        alignItems: "start",
                    }}
                >
                    <div style={{ display: "grid", gap: 12 }}>
                        <div style={cardStyle}>
                            <strong>Fixed input state</strong>
                            <KatexBlock math={`\\mathbf{s}=${ket(inputState)}`} />
                            {inputState.map((count, rail) => (
                                <div
                                    key={rail}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "70px 1fr",
                                        gap: 8,
                                        marginBottom: 8,
                                    }}
                                >
                                    <strong>Rail {rail}</strong>
                                    {photonDots(count)}
                                </div>
                            ))}
                        </div>

                        <div style={cardStyle}>
                            <strong>Candidate output state</strong>
                            <KatexBlock math={`\\mathbf{r}=${ket(outputState)}`} />

                            {outputState.map((count, rail) => (
                                <div
                                    key={rail}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "70px 1fr 70px",
                                        gap: 8,
                                        alignItems: "center",
                                        marginBottom: 8,
                                    }}
                                >
                                    <strong>Rail {rail}</strong>
                                    {photonDots(count)}
                                    <span style={{ display: "inline-flex", gap: 4 }}>
                                        <button
                                            type="button"
                                            style={buttonStyle}
                                            onClick={() => changeOutputRail(rail, -1)}
                                        >
                                            −
                                        </button>
                                        <button
                                            type="button"
                                            style={buttonStyle}
                                            onClick={() => changeOutputRail(rail, 1)}
                                        >
                                            +
                                        </button>
                                    </span>
                                </div>
                            ))}

                            <div style={{ fontSize: 13, color: "#475569" }}>
                                Output photons: <strong>{outputCount}</strong> / {photonCount}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: 16 }}>
                        {!valid && (
                            <div
                                style={{
                                    border: "1px solid #fecaca",
                                    background: "#fef2f2",
                                    color: "#991b1b",
                                    borderRadius: 12,
                                    padding: 12,
                                    fontSize: 13,
                                    fontWeight: 700,
                                }}
                            >
                                The output state must contain exactly {photonCount} photons.
                            </div>
                        )}

                        <div style={cardStyle}>
                            <strong>1. Cumulative unitary</strong>
                            <div style={{ overflowX: "auto", marginTop: 10 }}>
                                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                                    <thead>
                                        <tr>
                                            <th style={headerCellStyle}>out \ in</th>
                                            {unitary[0].map((_, c) => (
                                                <th key={c} style={headerCellStyle}>
                                                    Rail {c}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {unitary.map((row, r) => (
                                            <tr key={r}>
                                                <th style={headerCellStyle}>Rail {r}</th>
                                                {row.map((z, c) => (
                                                    <td
                                                        key={c}
                                                        style={{
                                                            ...cellStyle,
                                                            background: highlight.get(key(r, c)) ?? "#fff",
                                                        }}
                                                    >
                                                        <div style={{ fontSize: 12, fontWeight: 800 }}>
                                                            U<sub>{r}{c}</sub>
                                                        </div>
                                                        <KatexBlock math={formatComplex(z)} />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div style={cardStyle}>
                            <strong>2. Repeated submatrix</strong>
                            <div style={{ overflowX: "auto", marginTop: 10 }}>
                                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                                    <tbody>
                                        {submatrix.map((row, r) => (
                                            <tr key={r}>
                                                {row.map((z, c) => {
                                                    const outRail = outputRails[r];
                                                    const inRail = inputRails[c];

                                                    return (
                                                        <td
                                                            key={c}
                                                            style={{
                                                                ...cellStyle,
                                                                background: highlight.get(key(outRail, inRail)),
                                                            }}
                                                        >
                                                            <div style={{ fontSize: 12, fontWeight: 800 }}>
                                                                U<sub>{outRail}{inRail}</sub>
                                                            </div>
                                                            <KatexBlock math={formatComplex(z)} />
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div style={cardStyle}>
                            <strong>3. Permanent calculation</strong>

                            <KatexBlock
                                math={`\\operatorname{Per}(U_{\\mathbf{r},\\mathbf{s}})=${formatComplex(per)}`}
                            />

                            <KatexBlock
                                math={`A(\\mathbf{s}\\to\\mathbf{r})=\\frac{\\operatorname{Per}(U_{\\mathbf{r},\\mathbf{s}})}{\\sqrt{\\prod_i s_i!\\prod_j r_j!}}=\\frac{${formatComplex(per)}}{${formatReal(norm)}}=${formatComplex(amplitude)}`}
                            />

                            <KatexBlock
                                math={`P(\\mathbf{s}\\to\\mathbf{r})=|A|^2=${formatReal(probability)}`}
                            />

                            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                                The permanent appears because identical bosons require us to add the
                                amplitudes for every indistinguishable assignment of input photons to
                                output photons, without determinant-style minus signs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}