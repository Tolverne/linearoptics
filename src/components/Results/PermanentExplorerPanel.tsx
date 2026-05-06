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

    return (
        <div
            style={{ overflowX: "auto" }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function clean(x: number) {
    return Math.abs(x) < 1e-10 ? 0 : x;
}

function formatReal(x: number) {
    const mode = useExperimentStore.getState().numericDisplayMode;

    return formatNiceNumber(clean(x), {
        mode,
        latex: true,
        decimalPlaces: 4,
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

function conjugate(a: Complex): Complex {
    return { re: a.re, im: -a.im };
}

function scale(a: Complex, k: number): Complex {
    return { re: a.re * k, im: a.im * k };
}

function absSquared(a: Complex): number {
    return a.re * a.re + a.im * a.im;
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

function permanentComplex(matrix: Complex[][]): Complex {
    const n = matrix.length;

    if (n === 0) return { re: 1, im: 0 };
    if (n === 1) return matrix[0][0];

    let total: Complex = { re: 0, im: 0 };

    for (let col = 0; col < n; col++) {
        const minor = matrix.slice(1).map((row) => row.filter((_, j) => j !== col));
        total = add(total, mul(matrix[0][col], permanentComplex(minor)));
    }

    return total;
}

function permanentReal(matrix: number[][]): number {
    const n = matrix.length;

    if (n === 0) return 1;
    if (n === 1) return matrix[0][0];

    let total = 0;

    for (let col = 0; col < n; col++) {
        const minor = matrix.slice(1).map((row) => row.filter((_, j) => j !== col));
        total += matrix[0][col] * permanentReal(minor);
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

function permutations(values: number[]): number[][] {
    if (values.length <= 1) return [values];

    const out: number[][] = [];

    values.forEach((value, index) => {
        const rest = values.filter((_, j) => j !== index);
        permutations(rest).forEach((p) => out.push([value, ...p]));
    });

    return out;
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

function probabilityMatrix(submatrix: Complex[][]): number[][] {
    return submatrix.map((row) => row.map(absSquared));
}

function permutationAmplitude(
    submatrix: Complex[][],
    permutation: number[]
): Complex {
    return permutation.reduce<Complex>(
        (product, colIndex, rowIndex) => mul(product, submatrix[rowIndex][colIndex]),
        { re: 1, im: 0 }
    );
}

function mismatchCount(a: number[], b: number[]): number {
    return a.reduce((count, value, index) => count + (value === b[index] ? 0 : 1), 0);
}

function partialDistinguishableProbability(
    submatrix: Complex[][],
    eta: number,
    normalisation: number
): {
    probability: number;
    weightedSum: Complex;
    pathCount: number;
    termCount: number;
} {
    const n = submatrix.length;
    const perms = permutations(Array.from({ length: n }, (_, i) => i));
    const amplitudes = perms.map((perm) => permutationAmplitude(submatrix, perm));

    let weightedSum: Complex = { re: 0, im: 0 };

    perms.forEach((sigma, i) => {
        perms.forEach((tau, j) => {
            const weight = eta ** mismatchCount(sigma, tau);
            const contribution = scale(mul(amplitudes[i], conjugate(amplitudes[j])), weight);
            weightedSum = add(weightedSum, contribution);
        });
    });

    return {
        probability: clean(weightedSum.re / normalisation),
        weightedSum,
        pathCount: perms.length,
        termCount: perms.length * perms.length,
    };
}

function Section({
    title,
    children,
    description,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div style={cardStyle}>
            <strong>{title}</strong>
            {description && (
                <p style={{ margin: "8px 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                    {description}
                </p>
            )}
            {children}
        </div>
    );
}

export default function PermanentExplorerPanel() {
    const inputState = useExperimentStore((s) => s.inputState);
    const railCount = useExperimentStore((s) => s.railCount);
    const results = useExperimentStore((s) => s.results);
    const selectedStep = useExperimentStore((s) => s.selectedStep);
    const overlap = useExperimentStore((s) => s.overlap);

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
                    Run a simulation to generate the cumulative unitary.
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
            if (!highlight.has(k)) {
                highlight.set(k, colours[highlight.size % colours.length]);
            }
        });
    });

    const photonCount = inputState.reduce((a, b) => a + b, 0);
    const outputCount = outputState.reduce((a, b) => a + b, 0);
    const valid = photonCount === outputCount;

    const normalisation =
        fockFactorialProduct(inputState) * fockFactorialProduct(outputState);

    const quantumPer = valid ? permanentComplex(submatrix) : { re: 0, im: 0 };
    const quantumProbability = valid ? absSquared(quantumPer) / normalisation : 0;

    const probSubmatrix = probabilityMatrix(submatrix);
    const classicalPer = valid ? permanentReal(probSubmatrix) : 0;
    const classicalProbability = valid ? classicalPer / normalisation : 0;

    const partial = valid
        ? partialDistinguishableProbability(submatrix, overlap, normalisation)
        : {
            probability: 0,
            weightedSum: { re: 0, im: 0 },
            pathCount: 0,
            termCount: 0,
        };

    function changeOutputRail(rail: number, delta: number) {
        setOutputState((current) => {
            const next = [...current];
            const total = current.reduce((a, b) => a + b, 0);

            if (delta > 0 && total >= photonCount) return current;

            next[rail] = Math.max(0, next[rail] + delta);
            return next;
        });
    }

    return (
        <div style={panelStyle}>
            <div style={{ marginBottom: 14 }}>
                <h3 style={{ margin: 0, color: "#0f172a" }}>Permanent Explorer</h3>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                    Choose a candidate output state. The same repeated submatrix is used to compare
                    three cases: fully indistinguishable photons, fully distinguishable photons, and
                    the current partial distinguishability setting.
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

                        <Section
                            title="1. Cumulative unitary"
                            description="The highlighted entries are the single-photon probability amplitudes that are copied into the repeated submatrix."
                        >
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
                        </Section>

                        <Section
                            title="2. Repeated submatrix"
                            description="Rows are repeated according to the output photons. Columns are repeated according to the input photons."
                        >
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
                        </Section>

                        <Section
                            title="3. Fully indistinguishable photons, η = 1"
                            description="Amplitudes are summed first, then squared. This is the bosonic permanent calculation."
                        >
                            <KatexBlock
                                math={`\\operatorname{Per}(U_{\\mathbf{r},\\mathbf{s}})=${formatComplex(
                                    quantumPer
                                )}`}
                            />
                            <KatexBlock
                                math={`P_{\\eta=1}=\\frac{|\\operatorname{Per}(U_{\\mathbf{r},\\mathbf{s}})|^2}{\\prod_i s_i!\\prod_j r_j!}=${formatReal(
                                    quantumProbability
                                )}`}
                            />
                        </Section>

                        <Section
                            title="4. Fully distinguishable photons, η = 0"
                            description="Each path probability is calculated first, then the probabilities are added. This removes interference terms."
                        >
                            <KatexBlock
                                math={`U_{ij}\\mapsto |U_{ij}|^2`}
                            />
                            <KatexBlock
                                math={`P_{\\eta=0}=\\frac{\\operatorname{Per}(|U_{\\mathbf{r},\\mathbf{s}}|^2)}{\\prod_i s_i!\\prod_j r_j!}=${formatReal(
                                    classicalProbability
                                )}`}
                            />
                        </Section>

                        <Section
                            title={`5. Partially distinguishable photons, η = ${formatReal(overlap)}`}
                            description="This uses the same η value as the current photon-overlap slider. Path-pair interference terms are weighted: identical path pairs survive fully, while different path pairs are suppressed by powers of η."
                        >
                            <KatexBlock
                                math={`P_{\\eta}=\\frac{1}{\\prod_i s_i!\\prod_j r_j!}\\sum_{\\sigma,\\tau}\\left(\\prod_k U_{r_k,s_{\\sigma(k)}}\\right)\\left(\\prod_k U_{r_k,s_{\\tau(k)}}\\right)^*\\eta^{d(\\sigma,\\tau)}`}
                            />
                            <KatexBlock
                                math={`P_{\\eta=${formatReal(overlap)}}=${formatReal(partial.probability)}`}
                            />

                            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                                This calculation used <strong>{partial.pathCount}</strong> many-photon paths
                                and <strong>{partial.termCount}</strong> path-pair interference terms.
                            </p>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
}