import React from "react";
import { useExperimentStore } from "@/store/useExperimentStore";
import type {
  FinalDistributionEntry,
  SampledDistributionEntry,
} from "@/types/simulation";

function formatOccupationAsKet(occupation: number[]): string {
  return `|${occupation.join(",")}⟩`;
}

type RowData = {
  occupation: number[];
  probability: number;
  count?: number;
  frequency?: number;
};

function buildRows(
  finalDistribution: FinalDistributionEntry[],
  sampledDistribution?: SampledDistributionEntry[]
): RowData[] {
  const sampledMap = new Map<string, SampledDistributionEntry>();

  for (const entry of sampledDistribution ?? []) {
    sampledMap.set(entry.occupation.join(","), entry);
  }

  return finalDistribution.map((entry) => {
    const sample = sampledMap.get(entry.occupation.join(","));
    return {
      occupation: entry.occupation,
      probability: entry.probability,
      count: sample?.count,
      frequency: sample?.frequency,
    };
  });
}

const OutputTablePanel: React.FC = () => {
  const results = useExperimentStore((state) => state.results);

  if (!results || results.finalDistribution.length === 0) {
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
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 12,
          }}
        >
          Output Table
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
          Run a simulation to see exact probabilities and sampled counts.
        </div>
      </div>
    );
  }

  const rows = buildRows(
    results.finalDistribution,
    results.sampledDistribution
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
      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 12,
        }}
      >
        Output Table
      </div>

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
            minWidth: 580,
          }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                Output state
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                Exact probability
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                Sampled count
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                Sampled frequency
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.occupation.join(",")}-${index}`}>
                <td
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #e2e8f0",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {formatOccupationAsKet(row.occupation)}
                </td>

                <td
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #e2e8f0",
                    fontSize: 13,
                    color: "#334155",
                  }}
                >
                  {row.probability.toFixed(4)}
                </td>

                <td
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #e2e8f0",
                    fontSize: 13,
                    color: "#334155",
                  }}
                >
                  {typeof row.count === "number" ? row.count : "—"}
                </td>

                <td
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #e2e8f0",
                    fontSize: 13,
                    color: "#334155",
                  }}
                >
                  {typeof row.frequency === "number"
                    ? row.frequency.toFixed(4)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutputTablePanel;